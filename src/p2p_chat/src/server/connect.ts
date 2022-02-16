import { app, BrowserWindow, ipcMain, protocol, dialog } from "electron";
import signalhub from "signalhub";
import Peer from "simple-peer";
import wrtc from "wrtc";
import fs from "fs-extra";
import * as path from "path";
import readline from "readline";
import {
  createKeys,
  randomBytes,
  createHash,
  box,
  seal,
  sealOpen,
  boxOpen,
} from "./crypto";
import "dotenv/config";
import {
  Keys,
  FriendMetadata,
  PublicChannelMessage,
  PublicChannelMessagePayload,
  InviteResponseMessage,
  InviteAckMessage,
  PeerSignal,
} from "../shared/@types/types";

import { generateInviteLink, handleInviteLink } from "./linkHelpers";
import { writeToFS, buildChatDir } from "./fileHelpers";
import { getPublicKeyId, generateKeys } from "./keyHelpers";
import { formatMessageToStringifiedLog } from "./formatHelpers";

const hub = signalhub("p2p-tool", ["http://localhost:8080/"]);
// global.hub = signalhub("p2p-tool", ["http://localhost:8080/"]);
console.log(typeof hub);

/**
 * Connect:
 *
 *
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
    //TODO: Update the last connected key...
    ipcMain.on("send_message_to_peer", async (event, message) => {
      console.log("Listener for writing new data fired");
      console.log(message); //Message submitted by client
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
    console.log(name + ">", data.toString("utf8"));
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
