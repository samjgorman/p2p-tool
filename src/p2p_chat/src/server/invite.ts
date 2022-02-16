import { app, BrowserWindow, ipcMain, protocol, dialog } from "electron";
import fs from "fs-extra";
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
  pollIfFriendsOnline,
  listenForConnectionRequests,
  isRemotePeerOnline,
} from "./onlineOffline";

import { connect } from "./connect";

import {
  Keys,
  FriendMetadata,
  PublicChannelMessage,
  PublicChannelMessagePayload,
  InviteResponseMessage,
  InviteAckMessage,
  PeerSignal,
} from "../shared/@types/types";
import signalhub from "signalhub";
import { generateInviteLink, handleInviteLink } from "./linkHelpers";
import { getPublicKeyId, generateKeys } from "./keyHelpers";

const hub = signalhub("p2p-tool", ["http://localhost:8080/"]);

/**
 * initiateHandshake constructs a protocol URL inviteLink, broadcasts an invite
 * on a signalhub channel of its encrypted public key, then listens for
 * a response on this channel generated in acceptHandshake().  It then unseals the encrypted response, and validates
 * whether the response matches the encrypted password it sent in its invite.
 * If successful, the function sends an invite-ack to the peer. It then writes the
 * peer's public key and name to the user's friends.json,
 * then attempts to connect over WebRTC in connect().
 */
export async function initiateHandshake(
  me: Keys,
  name: string,
  initiator: boolean,
  recipient: string,
  friends: Record<string, FriendMetadata>,
  friendsPath: string,
  window: BrowserWindow
) {
  const isPeerOnline = await isRemotePeerOnline(name, recipient);
  console.log("Res says" + isPeerOnline); //IF the peer is offline, write offline messages to chat log
  const password = randomBytes(32);
  const inviteLink = generateInviteLink(password, name, me, window);

  const publicKey = await new Promise<Buffer>((resolve) => {
    const stream = hub.subscribe(getPublicKeyId(me.publicKey));

    stream.on("data", (message: PublicChannelMessage) => {
      if (message.type === "seal") {
        const data = sealOpen({
          payload: Buffer.from(message.payload, "base64"),
          to: me,
        });
        const result: PublicChannelMessagePayload = JSON.parse(
          data.toString("utf8")
        );
        if (result.type === "invite") {
          if (result.password === password.toString("base64")) {
            console.log("Passwords match");

            stream.destroy();
            resolve(Buffer.from(result.publicKey, "base64"));
          } else {
            console.error("wrong invite password");
          }
        } else {
          console.error("wrong public channel payload type");
        }
      } else {
        console.error("wrong public channel message type");
      }
    });
  });
  const message: InviteAckMessage = {
    type: "invite-ack",
  };
  const payload = box({
    message: Buffer.from(JSON.stringify(message), "utf8"),
    from: me,
    to: { publicKey },
  });

  const channelMessage: PublicChannelMessage = {
    type: "box",
    from: getPublicKeyId(me.publicKey),
    payload: payload.toString("base64"),
  };
  hub.broadcast(getPublicKeyId(publicKey), channelMessage);

  const friendMetadata: FriendMetadata = { publicKey: "", lastSeen: "" };
  friendMetadata.publicKey = publicKey.toString("base64");
  friends[recipient] = friendMetadata;

  await fs.writeJSON(friendsPath, friends);

  //Package and send a list of the user's friends
  window.webContents.send("get_all_friends_of_user", friends);

  connect(me, name, recipient, initiator, friends, window);
}
