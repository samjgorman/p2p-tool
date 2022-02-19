import { app, BrowserWindow, ipcMain, protocol, dialog } from "electron";
import signalhub from "signalhub";
import fs from "fs-extra";

import { seal, boxOpen } from "./crypto";
import "dotenv/config";
import {
  Keys,
  FriendMetadata,
  PublicChannelMessage,
  PublicChannelMessagePayload,
  InviteResponseMessage,
} from "../shared/@types/types";

import { connect } from "./connect";
import { getPublicKeyId } from "./keyHelpers";

// const hub = signalhub("p2p-tool", ["http://localhost:8080/"]);
const hub = signalhub("p2p-tool", [
  "https://evening-brook-96941.herokuapp.com/",
]);

/**
 * acceptHandshake constructs a password & publicKey, and subscribes & listens for
 * an invitation to signal on a signalhub channel of its encrypted public key.  If an invitation is found
 * ,it broadcasts a response on a signalhub channel of the encrypted public key sent in the invite.
 * If an invite-ack is received by the peer, the function writes the peer's public key and name to the
 * user's friends.json, then attempts to connect over WebRTC in connect().
 *
 */
export async function acceptHandshake(
  me: Keys,
  name: string,
  initiator: boolean,
  invitedBy: string,
  inviteToken: string,
  friends: Record<string, FriendMetadata>,
  friendsPath: string,
  window: BrowserWindow
) {
  const token = Buffer.from(inviteToken.trim(), "base64");
  const password = token.slice(0, 32).toString("base64");
  const publicKey = token.slice(32);

  const message: InviteResponseMessage = {
    type: "invite",
    password: password,
    publicKey: me.publicKey.toString("base64"),
  };
  const payload = seal({
    message: Buffer.from(JSON.stringify(message), "utf8"),
    to: { publicKey },
  });
  const channelMessage: PublicChannelMessage = {
    type: "seal",
    payload: payload.toString("base64"),
  };

  console.log("Sending invite response to", invitedBy);
  hub.broadcast(getPublicKeyId(publicKey), channelMessage);

  await new Promise<void>((resolve) => {
    const stream = hub.subscribe(getPublicKeyId(me.publicKey));
    stream.on("data", (message: PublicChannelMessage) => {
      if (message.type === "box") {
        if (message.from === getPublicKeyId(publicKey)) {
          const data = boxOpen({
            payload: Buffer.from(message.payload, "base64"),
            from: { publicKey },
            to: me,
          });
          const result: PublicChannelMessagePayload = JSON.parse(
            data.toString("utf8")
          );
          if (result.type === "invite-ack") {
            console.log("Void promise resolved");
            stream.destroy();
            resolve();
          } else {
            console.error("wrong payload type");
          }
        } else {
          console.error("message from the wrong person");
        }
      } else {
        console.error("wrong public channel message type");
      }
    });
  });

  const friendMetadata: FriendMetadata = { publicKey: "", lastSeen: "" };
  friendMetadata.publicKey = publicKey.toString("base64");
  friends[invitedBy] = friendMetadata;
  await fs.writeJSON(friendsPath, friends);

  //Package and send a list of the user's friends
  window.webContents.send("get_all_friends_of_user", friends);
  connect(me, name, invitedBy, initiator, friends, window);
}
