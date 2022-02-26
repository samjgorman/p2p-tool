import { app, BrowserWindow, ipcMain, protocol, dialog } from "electron";
import "dotenv/config";
import {
  sendConnectionRequests,
  listenForConnectionRequests,
  isRemotePeerOnline,
} from "./onlineOffline";

import {
  FriendData,
  FriendMetadata,
  MessageData,
} from "../shared/@types/types";
import { initiateHandshake } from "./invite";
import { acceptHandshake } from "./accept";
import { generateInviteLink, handleInviteLink } from "./linkHelpers";
import { writeToFS, getSentChatSessionPath } from "./fileHelpers";
import { getPublicKeyId, generateKeys } from "./keyHelpers";
import { formatMessageToStringifiedLog } from "./formatHelpers";

import { getAllFriends, getFriendData, getFriendsPath } from "./offlineChat";
import { watchFilesInDir } from "./merge";

// import { GlobalStyle } from "src/client/styles/GlobalStyle";

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
//Make browser window accessible in global scope across the file
let window: BrowserWindow = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const createWindow = (): BrowserWindow => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  return mainWindow;
};

/**
 * establishConnection fires in response to the "send_peer_metadata" event listener.
 * It initiates much of the core functionality of the application. The function generates
 * keys and a friend file in the identities directory. It polls whether other friends are online,
 * and listens for connection requests. Depending on whether the user selected initiator or non-initiator,
 * the function calls initiateHandshake or connectHandshake to begin webRTC signalling.
 * @param window
 * @param peerMetadata
 */
async function establishConnection(
  window: BrowserWindow,
  peerMetadata: string
) {
  //  Unpack JSON string to an object
  const peerMetadataObj = JSON.parse(peerMetadata);
  const initiator = peerMetadataObj.initiator;
  const name = peerMetadataObj.data.name;
  global.userName = name;

  //Generate keys
  const mykeys = await generateKeys(name);
  const friends: Record<string, FriendMetadata> = await getAllFriends(name);
  const friendsPath: string = await getFriendsPath(name);

  console.log("friends");
  console.log(friends);

  //Create peer listeners for each friend to connect to me
  listenForConnectionRequests(mykeys, name, initiator, friends, window);
  //Create peers to initiate a connection with each friend
  sendConnectionRequests(mykeys, name, initiator, window);
  //Package and send a list of the user's friends
  window.webContents.send("get_all_friends_of_user", friends);

  //Listen to any chat files in chat
  const pathToChat = "./files/chats";
  watchFilesInDir(pathToChat);

  if (initiator) {
    const recipient = peerMetadataObj.data.recipient;
    initiateHandshake(
      mykeys,
      name,
      initiator,
      recipient,
      friends,
      friendsPath,
      window
    );
  } else {
    const invitedBy = peerMetadataObj.data.invitedBy;
    const inviteToken = peerMetadataObj.data.inviteToken;
    acceptHandshake(
      mykeys,
      name,
      initiator,
      invitedBy,
      inviteToken,
      friends,
      friendsPath,
      window
    );
  }
}

/**
 * This comes from bridge integration, check bridge.ts
 */
async function registerListeners(window: BrowserWindow) {
  ipcMain.on("send_peer_metadata", (_, message) => {
    console.log(message);
    establishConnection(window, message);
  });

  ipcMain.on("get_friend_data", async (event, message) => {
    console.log("Request for getting friend chat object registered" + message);
    const friendData = await getFriendData(message);
    event.reply("friend_data_sent", friendData);
  });

  ipcMain.on("send_message_to_peer", async (event, message) => {
    console.log("Listener for writing new data fired");
    const payload: MessageData = JSON.parse(message);
    console.log(payload);
    console.log(payload.recipient);

    const log: string = formatMessageToStringifiedLog(
      global.userName,
      payload.message,
      global.numMessagesPeerReceived
    );
    const chatSessionPath = await getSentChatSessionPath(
      global.userName,
      payload.recipient
    );
    writeToFS(chatSessionPath, log);

    //Attempt to send the message to the remote peer
    event.reply("i_submitted_message", log); //Send the message back to the renderer process
  });
}

async function registerProtocols() {
  app.setAsDefaultProtocolClient("p2p");
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app
  .on("ready", () => {
    window = createWindow();
    registerProtocols(); //Register protocol routes
    registerListeners(window);
  })

  .whenReady()
  .then(() => {
    app.on("open-url", (event, url) => {
      event.preventDefault();
      //TODO: rewrite this to send data when app is not open
      handleInviteLink(url, window);
      dialog.showErrorBox("Welcome Back", `You arrived from: ${url}`);
    });
  })
  .catch((e) => console.error(e)); //TODO: check this code

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("quit", () => {
  ipcMain.removeAllListeners("send_message_to_peer");
  ipcMain.removeAllListeners("attempt_to_send_online_message_to_peer");
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
