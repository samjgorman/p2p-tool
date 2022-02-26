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
  OfflineSignal,
  OnlineData,
} from "../shared/@types/types";

import {
  writeToFS,
  buildMergeFile,
  populateChatDir,
  getChatSessionPath,
  getLengthOfChat,
  numOfflineMessagesToBeSent,
  getChatMessagesSentOffline,
} from "./fileHelpers";

import { getPublicKeyId, generateKeys } from "./keyHelpers";
import { formatMessageToStringifiedLog } from "./formatHelpers";
import { updateLastSeen } from "./onlineOffline";
import { getFriendData } from "./offlineChat";

const hub = signalhub("p2p-tool", [
  "https://evening-brook-96941.herokuapp.com/",
]);
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
          username: "samjgorman@gmail.com",
          credential: "p2pchat",
        },
        {
          urls: "turn:numb.viagenie.ca?transport=tcp",
          username: "samjgorman@gmail.com",
          credential: "p2pchat",
        },
      ],
    },
  });
  return peer;
}

/**
 * sendOfflineSignal is a helper function that creates an OfflineSignal object
 * to send to the remote peer.  This object contains the number of messages
 * the peer has received, which is used for determing whether there exist
 * messages that were sent offline by the remote peer that need to be received.
 * @param peer
 * @param name
 * @param identity
 * @param numMessagesPeerReceived
 */
export async function sendOfflineSignal(
  peer: Peer.Instance,
  name: string,
  identity: string,
  numMessagesPeerReceived: number
) {
  const offlineSignal: OfflineSignal = {
    type: "offlineSignal",
    numMessagesPeerReceived: numMessagesPeerReceived,
  };

  peer.send(JSON.stringify(offlineSignal));
}

/**
 * handlePeerSentData is a helper function that creates an OfflineSignal object via sendOfflineSignal,
 * and listens for attempts to send online messages to a remote peer.  If an event is found,
 * the function creates an OnlineData object to send to the remote peer over webRTC.
 */
export async function handlePeerSentData(
  peer: Peer.Instance,
  identity: string,
  name: string,
  window: BrowserWindow
) {
  console.log("Connected! " + identity + " to remote " + name);
  populateChatDir(identity, name); //Construct and populate a chat dir with sent, received, and merge logs
  updateLastSeen(identity, name, window);
  // global.numMessagesPeerReceived = await getLengthOfChat(name, identity);
  global.numMessagesPeerReceived = await getLengthOfChat(identity, name);

  sendOfflineSignal(peer, name, identity, global.numMessagesPeerReceived);

  async function listener(event: Electron.IpcMainEvent, message: string) {
    console.log("Listener to package online data fired");
    const onlineData: OnlineData = {
      type: "onlineData",
      data: message,
    };
    peer.send(JSON.stringify(onlineData)); //Send the client submitted message to the peer
  }
  ipcMain.on("attempt_to_send_online_message_to_peer", listener);
}

/**
 * handleRemotePeerSentData is a helper function that processes data sent by
 * the remote peer over webRTC.  If the type is an offline signal, it calls handleOfflineMessages
 * to send offline messages if necessary.  If type is online data, the function writes this data
 * to the local file system and sends this message to the client via IPC to render.
 */
export async function handleRemotePeerSentData(
  peer: Peer.Instance,
  identity: string,
  name: string,
  data: string,
  window: BrowserWindow
) {
  //Upon receiving new data, check if the received user's length
  // is in sync with messagesSent
  const parsedData: OfflineSignal | OnlineData = JSON.parse(data);

  if (parsedData.type == "offlineSignal") {
    handleOfflineMessages(peer, parsedData, identity, name);
  } else if (parsedData.type == "onlineData") {
    const receivedLog: string = parsedData.data;
    const ifRemote = true;
    const chatSessionPath = await getChatSessionPath(identity, name, ifRemote);

    writeToFS(chatSessionPath, receivedLog);
    window.webContents.send("peer_submitted_message", receivedLog);
  }
}

/**
 * handleOfflineMessages is a helper function that determines whether
 * the peer has sent messages to the remote peer offline that must now
 * be sent.  It does so by getting the length of the peerSentLog,
 * and comparing to the remotePeerReceivedLog.
 *
 * If the difference of peerSentLog - remotePeerReceivedLog > 0, there
 * exists offline messages to be sent.  The function then grabs these messages, formats them
 * as OnlineData,  and sends them one at a time via webRTC.
 * @param peer
 * @param receivedData
 * @param identity
 * @param name
 */
export async function handleOfflineMessages(
  peer: Peer.Instance,
  receivedData: OfflineSignal,
  identity: string,
  name: string
) {
  //Construct an array of objects
  const numRemotePeerReceivedLog = receivedData.numMessagesPeerReceived;
  const numPeerSentLog = await getLengthOfChat(identity, name);
  console.log("numPeerSentLog is " + numPeerSentLog);
  const dif = numOfflineMessagesToBeSent(
    numPeerSentLog,
    numRemotePeerReceivedLog
  );
  if (dif > 0) {
    const offlineMessagesToSend: Array<object> =
      await getChatMessagesSentOffline(identity, name, dif, numPeerSentLog);
    //Now, send each offline message as OnlineData
    for (const chatMessage of offlineMessagesToSend) {
      const onlineData: OnlineData = {
        type: "onlineData",
        data: JSON.stringify(chatMessage),
      };

      peer.send(JSON.stringify(onlineData));
    }
  }
}

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
  peer.on("data", async (data: string) => {
    await handleRemotePeerSentData(peer, identity, name, data, window);
  });

  peer.on("close", () => {
    console.log("close");
    ipcMain.removeAllListeners("attempt_to_send_online_message_to_peer");
  });
  peer.on("error", (error) => {
    console.log("error", error);
  });
  peer.on("end", () => {
    ipcMain.removeAllListeners("attempt_to_send_online_message_to_peer");
    console.log("Disconnected!");
  });
}
