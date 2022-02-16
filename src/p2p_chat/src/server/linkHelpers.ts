import { Keys, FriendMetadata } from "../shared/@types/types";
import { app, BrowserWindow, ipcMain, protocol, dialog } from "electron";
import { getPublicKeyId, generateKeys } from "./keyHelpers";
import { acceptHandshake } from "./accept";

import * as path from "path";
import fs from "fs-extra";
import { getAllFriends, getFriendsPath } from "./offlineChat";

/**
 * generateInviteLink is a helper function called by initiateHandshake that creates a protocol URL in the form
 * p2p://name=abc&invite=123. It then sends this inviteLink via IPC to the client to render.
 * @param password
 * @param name
 * @param me
 * @param window
 * @returns inviteLink:string
 */
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

/**
 * handleInviteLink is a helper function called in an app event listener in main.ts
 * that parses an inviteLink and validates that this link is correctly formatted.
 * If the link is validated, parses name and publicKey from link and sends to client via IPC
 * to confirm they wish to begin a connection. Listens for acceptance,
 * then calls acceptHandshake if confirmed.
 * @param url
 * @param window
 */
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

      const connectionConfirmed = await new Promise<boolean>((resolve) => {
        ipcMain.on("if_connection_confirmed", async (event, message) => {
          console.log(
            "received response from connection confirmation " + message
          );
          resolve(message);
        });
      });

      if (connectionConfirmed) {
        //Generate keys
        const mykeys = await generateKeys(global.userName);
        const friendsPath = await getFriendsPath(global.userName);
        const friends = await getAllFriends(global.userName);

        const initiator = false;
        acceptHandshake(
          mykeys,
          global.userName,
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
