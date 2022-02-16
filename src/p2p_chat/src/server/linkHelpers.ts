import {
  Keys,
  FriendMetadata,
  PublicChannelMessage,
  PublicChannelMessagePayload,
  InviteResponseMessage,
  InviteAckMessage,
  PeerSignal,
} from "../shared/@types/types";
import { app, BrowserWindow, ipcMain, protocol, dialog } from "electron";
import { getPublicKeyId, generateKeys } from "./keyHelpers";
import { acceptHandshake } from "./accept";

import * as path from "path";
import fs from "fs-extra";
v;
export function generateInviteLink(
  password: Buffer,
  name: string,
  me: Keys,
  window: BrowserWindow
): string {
  // Create an invite payload
  const invite = Buffer.concat([password, me.publicKey]).toString("base64");
  //Format as a magic link
  const baseUrl = "p2p://";
  const nameParam = "name=" + name;
  const inviteParam = "invite=" + invite;

  const inviteLink = baseUrl + nameParam + "&" + inviteParam;
  console.log(`Send this magic link`);
  console.log(inviteLink);

  window.webContents.send("send_invite_link", inviteLink);

  return inviteLink;
}

export async function handleInviteLink(url: string, window: BrowserWindow) {
  const baseOffset = 6; //When the params begin after p2p://
  const nameOffset = 5; //The amount of chars in name=
  const inviteOffset = 7; //The amount of chars in invite=
  if (url.search("name=") !== -1) {
    if (url.search("invite=") !== -1) {
      const urlWithBaseTruncated = url.substring(baseOffset);
      const splitByParamsUrl = urlWithBaseTruncated.split("&");
      //Will split by p2p://user=xyz, id=abc
      const rawNameParam = splitByParamsUrl[0];
      const rawInviteParam = splitByParamsUrl[1];
      const nameParam = rawNameParam.substring(nameOffset);
      const inviteParam = rawInviteParam.substring(inviteOffset);
      console.log("this is name param" + nameParam);
      //Pass this name to a frontend confirmation component...
      window.webContents.send("confirm_connection", nameParam);

      //Listen for confirmation to connect
      const connectionConfirmed = await new Promise<boolean>((resolve) => {
        ipcMain.on("if_connection_confirmed", async (event, message) => {
          console.log(
            "received response from connection confirmation " + message
          );
          resolve(message);
        });
      });

      if (connectionConfirmed) {
        //Accept a connection...
        //Generate keys
        const mykeys = await generateKeys(GLOBAL_USER_NAME);
        //TODO: refactor
        const identityPath = path.join(
          __dirname,
          "../../files",
          "identities",
          nameParam
        );
        // const identityPath = path.join(__dirname, "../../files", "me", name);
        const friendsPath = path.join(identityPath, "friends.json");
        // let friends: Record<string, string> = {};
        let friends: Record<string, FriendMetadata> = {};

        if (await fs.pathExists(friendsPath)) {
          friends = await fs.readJSON(friendsPath);
        }
        const initiator = false;
        acceptHandshake(
          mykeys,
          GLOBAL_USER_NAME,
          initiator,
          nameParam,
          inviteParam,
          friends,
          friendsPath,
          window
        );
      } else {
        console.log("User decided not to connect.");
      }
    } else {
      console.error("Url string does not contain name param");
    }
  } else {
    console.error("Url string does not contain name param");
  }
}
