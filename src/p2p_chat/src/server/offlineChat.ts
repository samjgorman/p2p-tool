import readline from "readline";
import { generateInviteLink, handleInviteLink } from "./linkHelpers";
import { writeToFS, buildChatDir } from "./fileHelpers";
import { getPublicKeyId, generateKeys } from "./keyHelpers";
import fs from "fs-extra";
import { app, BrowserWindow, ipcMain, protocol, dialog } from "electron";

export async function getFriendChatObject(
  window: BrowserWindow,
  message: string
): Promise<object> {
  const friendName = message;
  const chatHistoryObject: Array<object> = [];
  console.log("Friend name in main" + friendName);
  //TODO: retrieve json chat, stringify, and send
  if (GLOBAL_USER_NAME !== null) {
    // const candidateChatPath = GLOBAL_USER_NAME + "_" + friendName + ".json";
    const candidateChatPath = await buildChatDir(GLOBAL_USER_NAME, friendName);
    console.log("Candidate chat path is " + candidateChatPath);
    if (await fs.pathExists(candidateChatPath)) {
      // const chatHistoryObject = await fs.readJSON(candidateChatPath);
      //Read the file line by line into an array of objects
      const fileStream = fs.createReadStream(candidateChatPath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });
      // Note: we use the crlfDelay option to recognize all instances of CR LF
      // ('\r\n') in input.txt as a single line break.
      for await (const line of rl) {
        // Each line in input.txt will be successively available here as `line`.
        // console.log(`Line from file: ${line}`);
        const lineObject = JSON.parse(line);
        chatHistoryObject.push(lineObject);
      }

      return chatHistoryObject;
    } else {
      console.log("No chat history yet");
      //    } else{
      //   console.error("User's identity not yet established ")
    }
  } else {
    console.error("Identity not yet established");
  }
}
