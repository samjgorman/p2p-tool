import { app, BrowserWindow, ipcMain, protocol, dialog } from "electron";
import signalhub from "signalhub";
import Peer from "simple-peer";
import wrtc from "wrtc";
import { box, boxOpen } from "./crypto";
import "dotenv/config";
import {
  Keys,
  FriendMetadata,
  PublicChannelMessage,
  PublicChannelMessagePayload,
  PeerSignal,
} from "../shared/@types/types";

import {
  writeToFS,
  buildChatDir,
  getLengthOfChat,
  numOfflineMessagesToBeSent,
  getChatMessagesSentOffline,
} from "./fileHelpers";

import { getPublicKeyId, generateKeys } from "./keyHelpers";
import { formatMessageToStringifiedLog } from "./formatHelpers";
import { updateLastSeen } from "./onlineOffline";
import { getFriendChatObject } from "./offlineChat";

const hub = signalhub("p2p-tool", ["http://localhost:8080/"]);
// global.hub = signalhub("p2p-tool", ["http://localhost:8080/"]);

/**
 * constructPeer is a helper function that builds a new peer object
 * with a configured stun and turn server.
 * @param initiator
 * @returns
 */
export function constructPeer(initiator: boolean) {
  const peer = new Peer({
    initiator,
    wrtc: wrtc,
    trickle: false,
    config: {
      iceServers: [
        {
          urls: "stun:numb.viagenie.ca?transport=tcp", //avoid UDP rules & work around network blocks
          username: process.env.STUN_TURN_USER,
          credential: process.env.STUN_TURN_PASS,
        },
        {
          urls: "turn:numb.viagenie.ca?transport=tcp",
          username: process.env.STUN_TURN_USER,
          credential: process.env.STUN_TURN_PASS,
        },
      ],
    },
  });
  return peer;
}

/**
 * handleConnectedState is a helper function that sends message the peer has sent when connected
 * to the client via IPC.  The message is formatted and written to chats.
 */
export async function handlePeerSentData(
  peer: Peer.Instance,
  identity: string,
  name: string,
  window: BrowserWindow
) {
  console.log("Connected! " + identity + " to remote " + name);

  //TODO: send the numReceivedMessages property to remote peer
  //TODO: write last_seen upon connecting to a peer
  updateLastSeen(identity, name, window);

  //# of messages received by the remote peer
  const numPeerReceivedLog = await getLengthOfChat(name, identity);
  console.log("This is the # of received messages " + numPeerReceivedLog);
  //Send this number to the peer immediately?
  const numObject = {
    type: "numPeerReceived",
    numPeerReceivedLog: numPeerReceivedLog,
  };
  peer.send(JSON.stringify(numObject));

  ipcMain.on("send_message_to_peer", async (event, message) => {
    console.log("Listener for writing new data fired");
    const log = formatMessageToStringifiedLog(
      identity,
      message,
      numPeerReceivedLog
    );
    const chatSessionPath = await buildChatDir(identity, name);
    writeToFS(chatSessionPath, log);
    peer.send(log); //Send the client submitted message to the peer
    event.reply("i_submitted_message", log); //Send the message back to the renderer process
  });
}

export async function handleRemotePeerSentData(
  peer: Peer.Instance,
  identity: string,
  name: string
) {}

/**
 * Connect retrieves the publicKey of the remotePeer, then creates a
 * webRTC peer connection object via simple-peer.
 *
 * Depending on the value of the initiatior boolean param, this peer will be an
 * initiator or non-initiator.
 *
 * If the peer is an initiator:
 * The peer's event listener on("signal") will fire immediately.
 * This signal is encrypted then sent over a SignalHub channel of the remotePeer's publicKey.
 *
 * Then, the peer subscribes to a signalhub channel of its own publicKey, and listens for data with stream.on('data')
 * Upon a valid response from the remotePeer, the peer signals back to the remotePeer via a signalhub channel of the remote
 * publicKey.
 *
 * If the peer is a non-initiator:
 *
 * The peer subscribes to a signalhub channel of its own publicKey, and listens for data with stream.on('data')
 * Upon a valid response from the remotePeer, the peer signals back to the remotePeer via a signalhub channel of the remote
 * publicKey.
 *
 * In both cases:
 *
 * The peer listens for a successful connection state, and if successful, for data received by the remotePeer.
 * Messages sent to and received by the remotePeer are formatted and written to the local filesystem in the chats directory.
 * Messages are then passed to the client via IPC to be rendered.
 */
export function connect(
  me: Keys,
  identity: string,
  name: string,
  initiator: boolean,
  friends: Record<string, FriendMetadata>,
  window: BrowserWindow
) {
  //Get public key of recipient of message
  const publicKey = Buffer.from(friends[name].publicKey, "base64");
  console.log("Public key of recipient");
  console.log(friends[name]);
  const peer: Peer.Instance = constructPeer(initiator);
  peer._debug = console.log;

  peer.on("signal", function (data) {
    const payload: PeerSignal = {
      type: "signal",
      data: data,
    };
    const message: PublicChannelMessage = {
      type: "box",
      from: getPublicKeyId(me.publicKey),
      payload: box({
        message: Buffer.from(JSON.stringify(payload), "utf8"),
        from: me,
        to: { publicKey },
      }).toString("base64"),
    };
    hub.broadcast(getPublicKeyId(publicKey), message);
  });

  const stream = hub.subscribe(getPublicKeyId(me.publicKey));
  stream.on("data", (message: PublicChannelMessage) => {
    if (message.type !== "box") {
      console.error("Wrong message type");
      return;
    }
    if (message.from !== getPublicKeyId(publicKey)) {
      console.error("Wrong person");
      return;
    }
    const result: PublicChannelMessagePayload = JSON.parse(
      boxOpen({
        payload: Buffer.from(message.payload, "base64"),
        from: { publicKey },
        to: me,
      }).toString("utf8")
    );

    if (result.type !== "signal") {
      console.log("wrong payload type");
      return;
    }

    peer.signal(result.data);
    stream.destroy();
  });

  peer.on("connect", async () => {
    await handlePeerSentData(peer, identity, name, window);
  });

  //Received new message from sending peer
  peer.on("data", async (data) => {
    //Upon receiving new data, check if the received user's length
    // is in sync with messagesSent
    const jsonData = JSON.parse(data);
    if (jsonData.type == "numPeerReceived") {
      console.log(
        "Received num from remote peer and is " + jsonData.numPeerReceivedLog
      );
      //Construct an array of objects
      const numRemotePeerReceivedLog = jsonData.numPeerReceivedLog;
      const numPeerSentLog = await getLengthOfChat(identity, name);
      console.log("numPeerSentLog is " + numPeerSentLog);
      const dif = numOfflineMessagesToBeSent(
        numPeerSentLog,
        numRemotePeerReceivedLog
      );
      if (dif > 0) {
        const offlineMessagesToSend: Array<object> =
          await getChatMessagesSentOffline(identity, name, dif, numPeerSentLog);
        //Now, send each offline message
        for (const chatMessage of offlineMessagesToSend) {
          // const log = formatMessageToStringifiedLog(
          //   identity,
          //   chatMessage.toString(),
          //   2 //Temp
          // );
          const chatMessageString = JSON.stringify(chatMessage);
          peer.send(chatMessageString);
        }
      }
    } else {
      const receivedLog = data.toString("utf8");
      //Write received messages to a different file...
      const chatSessionPath = await buildChatDir(name, identity);
      writeToFS(chatSessionPath, receivedLog);
      window.webContents.send("peer_submitted_message", receivedLog);
    }
  });
  peer.on("close", () => {
    console.log("close");
  });
  peer.on("error", (error) => {
    console.log("error", error);
  });
  peer.on("end", () => {
    console.log("Disconnected!");
  });
}
