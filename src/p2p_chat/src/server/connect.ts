import { app, BrowserWindow, ipcMain, protocol, dialog } from "electron";
import signalhub from "signalhub";
import Peer from "simple-peer";
import wrtc from "wrtc";
import fs from "fs-extra";
import * as path from "path";
import readline from "readline";
import { box, boxOpen } from "./crypto";
import "dotenv/config";
import {
  Keys,
  FriendMetadata,
  PublicChannelMessage,
  PublicChannelMessagePayload,
  PeerSignal,
} from "../shared/@types/types";

import { writeToFS, buildChatDir } from "./fileHelpers";
import { getPublicKeyId, generateKeys } from "./keyHelpers";
import { formatMessageToStringifiedLog } from "./formatHelpers";

const hub = signalhub("p2p-tool", ["http://localhost:8080/"]);
// global.hub = signalhub("p2p-tool", ["http://localhost:8080/"]);
console.log(typeof hub);

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
    console.log("Connected!");
    ipcMain.on("send_message_to_peer", async (event, message) => {
      console.log("Listener for writing new data fired");
      const log = formatMessageToStringifiedLog(identity, message); //Check this
      const chatSessionPath = await buildChatDir(identity, name);
      writeToFS(chatSessionPath, log);
      peer.send(log); //Send the client submitted message to the peer
      event.reply("i_submitted_message", log); //Send the message back to the renderer process
    });
  });

  //Received new message from sending peer
  peer.on("data", async (data) => {
    const receivedLog = data.toString("utf8");
    //Received message from peer, write this to the local fs
    const chatSessionPath = await buildChatDir(identity, name);
    writeToFS(chatSessionPath, receivedLog);
    window.webContents.send("peer_submitted_message", receivedLog);
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
