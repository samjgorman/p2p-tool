import readline from "readline";
import { generateInviteLink, handleInviteLink } from "./linkHelpers";
import { writeToFS, buildChatDir } from "./fileHelpers";
import { getPublicKeyId, generateKeys } from "./keyHelpers";
import fs from "fs-extra";
import { app, BrowserWindow, ipcMain, protocol, dialog } from "electron";
import { Keys, FriendMetadata } from "../shared/@types/types";
import * as path from "path";

/**
 *
 * @param window
 * @param message
 * @returns
 */
export async function getFriendChatObject(
  window: BrowserWindow,
  message: string
): Promise<object> {
  const friendName = message;
  const chatHistoryObject: Array<object> = [];
  if (global.userName !== null) {
    const candidateChatPath = await buildChatDir(global.userName, friendName);
    console.log("Candidate chat path is " + candidateChatPath);
    if (await fs.pathExists(candidateChatPath)) {
      //Read the file line by line into an array of objects
      const fileStream = fs.createReadStream(candidateChatPath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });
      // Note: we use the crlfDelay option to recognize all instances of CR LF
      // ('\r\n') in the file as a single line break.
      for await (const line of rl) {
        // Each line in input.txt will be successively available here as `line`.
        const lineObject = JSON.parse(line);
        chatHistoryObject.push(lineObject);
      }
      return chatHistoryObject;
    } else {
      console.log("No chat history yet");
    }
  } else {
    console.error("Identity not yet established");
  }
}

/**
 *
 * @param name
 * @returns
 */
export async function getAllFriends(
  name: string
): Promise<Record<string, FriendMetadata>> {
  const friendsPath = await getFriendsPath(name);
  let friends: Record<string, FriendMetadata> = {};

  if (await fs.pathExists(friendsPath)) {
    friends = await fs.readJSON(friendsPath);
  }

  return friends;
}

/**
 *
 * @param name
 * @returns
 */
export async function getFriendsPath(name: string): Promise<string> {
  const identityPath = path.join(__dirname, "../../files", "identities", name);
  const friendsPath = path.join(identityPath, "friends.json");
  return friendsPath;
}
