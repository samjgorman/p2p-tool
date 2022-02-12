import { app, BrowserWindow, ipcMain, protocol, dialog } from "electron";
import signalhub from "signalhub";
import Peer from "simple-peer";
import wrtc from "wrtc";
import fs from "fs-extra";
import * as path from "path";
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

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

function getPublicKeyId(publicKey: Buffer) {
  return createHash(publicKey).toString("base64");
}

type PublicChannelMessage =
  | { type: "seal"; payload: string }
  | { type: "box"; from: string; payload: string }
  | { type: "syn"; from: string; payload: string }
  | { type: "syn-ack"; from: string; payload: string };

type PublicChannelMessagePayload =
  | InviteResponseMessage
  | InviteAckMessage
  | PeerSignal;

type InviteResponseMessage = {
  type: "invite";
  password: string;
  publicKey: string;
};

type InviteAckMessage = { type: "invite-ack" };

type PeerSignal = {
  type: "signal";
  data: any;
};

type Keys = {
  publicKey: Buffer;
  secretKey: Buffer;
};

type FriendMetadata = {
  publicKey: string;
  lastSeen: string;
};

async function generateKeys(identity: string): Promise<Keys> {
  const identityPath = path.join(
    __dirname,
    "../../files",
    "identities",
    identity
  );

  console.log(identityPath);
  await fs.mkdirp(identityPath);

  const publicKeyPath = path.join(identityPath, "public.key");
  const secretKeyPath = path.join(identityPath, "secret.key");

  let me: { publicKey: Buffer; secretKey: Buffer };
  if (!(await fs.pathExists(publicKeyPath))) {
    console.log("Generating keys.");
    me = createKeys();
    await fs.writeFile(publicKeyPath, me.publicKey);
    await fs.writeFile(secretKeyPath, me.secretKey);
  } else {
    me = {
      publicKey: await fs.readFile(publicKeyPath),
      secretKey: await fs.readFile(secretKeyPath),
    };
  }

  return me;
}

//  This util appends to a file
async function writeToFS(fileNamePath: string, message: string) {
  if (message.length > 0) {
    fs.appendFile(fileNamePath, message + "\n", (err) => {
      if (err) {
        console.error("Error appending to file" + err);
      }
      // } else {
      //   // Get the file contents after the append operation
      //   console.log(
      //     '\nFile Contents of file after append:',
      //     fs.readFileSync('test.txt', 'utf8')
      //   )
      // }
    });
  } else {
    console.error("Message to write to fs is empty ");
  }
}

async function buildChatDir(identity: string, name: string): Promise<string> {
  const dirName = identity + "_" + name;
  const chatPath = path.join(__dirname, "../../files", "chats", dirName);
  await fs.mkdirp(chatPath);

  const fileName = identity + "_" + name + ".json";

  const chatSessionPath = path.join(chatPath, fileName);

  //If file has not already been created, create it
  if (!(await fs.pathExists(chatSessionPath))) {
    //TODO: check if opposite path exists too
    console.log("Generating unique chat file." + chatSessionPath);
    fs.open(chatSessionPath, "wx", function (err, fd) {
      //Wx flag creates empty file async
      console.error(err);
      fs.close(fd, function (err) {
        console.error(err);
      });
    });
  }
  return chatSessionPath;
}

function formatMessageToStringifiedLog(
  identity: string,
  message: string
): string {
  const log = {
    timestamp: Date.now(),
    sender: identity,
    message: message, //Check this
  };
  const stringified_log = JSON.stringify(log);
  return stringified_log;
}

const hub = signalhub("p2p-tool", ["http://localhost:8080/"]);
/**
 * Connect
 * @param identity  -> String identity of the sender of the message
 * @param name  -> String Name of the recipient of the message
 * @param initiator -> Bool representing if initiator of the wrtc connection
 */
function connect(
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

function generateInviteLink(
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

//  This function initiates a handshake to connect to a peer
async function initiateHandshake(
  me: Keys, //TODO: better way to pass around keys
  name: string,
  initiator: boolean,
  recipient: string,
  friends: Record<string, FriendMetadata>,
  friendsPath: string,
  window: BrowserWindow
) {
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

  // friends[recipient] = publicKey.toString("base64"); //this should be recipient?
  // let friendMetadata: FriendMetadata;
  const friendMetadata: FriendMetadata = { publicKey: "", lastSeen: "" };
  friendMetadata.publicKey = publicKey.toString("base64");
  console.log("Friend md in initiate" + friendMetadata.publicKey);
  friends[recipient] = friendMetadata;

  await fs.writeJSON(friendsPath, friends);

  //Package and send a list of the user's friends
  window.webContents.send("get_all_friends_of_user", friends);

  //Now that encryption matches, attempt to connect
  connect(me, name, recipient, initiator, friends, window);
}

//  This function accepts a handshake to connect to a peer
async function acceptHandshake(
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
  console.log("Friend md in initiate" + friendMetadata.publicKey);

  friends[invitedBy] = friendMetadata;
  await fs.writeJSON(friendsPath, friends);

  //Package and send a list of the user's friends
  window.webContents.send("get_all_friends_of_user", friends);

  //Now that encryption matches, attempt to connect
  connect(me, name, invitedBy, initiator, friends, window);
}

declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const createWindow = (): BrowserWindow => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    backgroundColor: "#191622",
    webPreferences: {
      nodeIntegration: false, //TODO: refactor to false
      contextIsolation: true, //refactor to true
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  return mainWindow;
};

async function updateLastSeen(name: string, friendName: string) {
  //TODO: write this last_seen to file...
  // const lastSeenPath = path.join(__dirname, "../../files", "lastSeen", name);
  // const lastSeenFriendsPath = path.join(lastSeenPath, "lastSeenFriends.json");
  // let lastSeenFriends: FriendsSchema = {};

  // if (await fs.pathExists(lastSeenFriendsPath)) {
  //   lastSeenFriends = await fs.readJSON(lastSeenFriendsPath);
  // }
  // lastSeenFriends[friendName] = Date.now();
  // await fs.writeJSON(lastSeenFriendsPath, lastSeenFriends);
  const identityPath = path.join(__dirname, "../../files", "identities", name);
  const friendsPath = path.join(identityPath, "friends.json");
  let friends: Record<string, FriendMetadata> = {}; //may need an array

  if (await fs.pathExists(friendsPath)) {
    friends = await fs.readJSON(friendsPath);
  }
  // const friendMetadata: FriendMetadata = friends[friendName];
  friends[friendName].lastSeen = Date.now().toString();

  await fs.writeJSON(friendsPath, friends);
}

async function pollIfFriendsOnline(
  me: Keys,
  name: string,
  initiator: boolean,
  window: BrowserWindow
) {
  //From a user's name, search for their JSON file and read it...
  const identityPath = path.join(__dirname, "../../files", "identities", name);
  const friendsPath = path.join(identityPath, "friends.json");
  let friends: Record<string, FriendMetadata> = {}; //may need an array

  if (await fs.pathExists(friendsPath)) {
    friends = await fs.readJSON(friendsPath);
  }
  console.log("After retrieving friends...");
  console.log(friends);

  //Now, write the contents of the friends object to the lastSeenFriends
  const friendsKeyValuePairs = Object.entries(friends); //get key value pairs
  const pollingAvailability = true; //Set to polling availability mode to avoid reading and writing to files

  for (const [key, value] of friendsKeyValuePairs) {
    console.log(key + ":" + value);
    //Given the key and value, attempt to connect to the peer and report its status
    const friendName = key;
    // const publicKey = value;
    const friendMetadata = value;
    const publicKey = friendMetadata.publicKey; //Now that encryption matches, attempt to connect to each peer in the list
    console.log("Polling if " + friendName + " is available");

    const channelMessage: PublicChannelMessage = {
      type: "syn",
      from: me.publicKey.toString("base64"),
      payload: "This is a test", //TODO: refactor this...
    };

    hub.broadcast(publicKey + "invite", channelMessage); //Broadcast to public key of peer we are testing
    const stream = hub.subscribe(me.publicKey.toString("base64") + "ack"); //Subscribe to your own public key

    //Listen for an ACK for a set period of time
    let ackReceived = false;
    setTimeout(function () {
      if (!ackReceived) {
        // show notification that evt has not been fired
        console.log("Ack not received " + friendName + " is offline");
        stream.destroy();
      }
    }, 3000);

    stream.on("data", (message: PublicChannelMessage) => {
      console.log("Message received back from connection listener");

      if (message.type === "syn-ack") {
        if (message.from == publicKey) {
          //===
          console.log(
            "Ack received from remote peer," + friendName + " is online "
          );
          ackReceived = true;
          updateLastSeen(name, friendName);

          stream.destroy();
        } else {
          console.error("Syn ack received is not from the intended peer");
        }
      } else {
        console.error("Message type response is not valid");
      }
    });
  }
}

//Listener that opens a peer object with initiator off
async function listenForConnectionRequests(
  me: Keys,
  name: string,
  initiator: boolean,
  friends: Record<string, FriendMetadata>,
  window: BrowserWindow
) {
  const inviteAck: InviteAckMessage = {
    type: "invite-ack",
  };

  const channelMessage: PublicChannelMessage = {
    type: "syn-ack",
    from: me.publicKey.toString("base64"),
    payload: JSON.stringify(inviteAck),
  };

  //Subscribe to hub of my own public key
  const stream = hub.subscribe(me.publicKey.toString("base64") + "invite"); //Check the iD here
  const friendsKeyValuePairs = Object.entries(friends); //get key value pairs

  stream.on("data", (message: PublicChannelMessage) => {
    console.log("Message received from connection listener");
    if (message.type === "syn") {
      let matchFound = false;
      for (const [key, value] of friendsKeyValuePairs) {
        const friendName = key;
        // const publicKey = value;
        const friendMetadata = value;
        const publicKey = friendMetadata.publicKey;

        if (message.from == publicKey) {
          //===
          console.log(
            "Match found from " + friendName + " connection listener"
          );
          matchFound = true;
          //Sent an ACK to the sender's public key
          hub.broadcast(message.from + "ack", channelMessage);
          // stream.destroy();
        }
      }

      if (!matchFound) {
        console.error(
          "message from a person not in the user's friend.json " + message.from
        );
      }
    } else {
      console.error("wrong public channel message type" + message.type);
    }
  });
}

//GLOBAL VARS TO TEST
let GLOBAL_USER_NAME: string;
//  This begins the webRTC connection process
async function establishConnection(
  window: BrowserWindow,
  peerMetadata: string
) {
  //  Unpack JSON string to an object
  const peerMetadataObj = JSON.parse(peerMetadata);
  const initiator = peerMetadataObj.initiator;
  const name = peerMetadataObj.data.name;
  GLOBAL_USER_NAME = name;

  //Check if a file with this name exists in identity
  //Generate keys
  const mykeys = await generateKeys(name);
  //TODO: refactor
  const identityPath = path.join(__dirname, "../../files", "identities", name);
  const friendsPath = path.join(identityPath, "friends.json");
  // let friends: Record<string, string> = {};
  let friends: Record<string, FriendMetadata> = {};

  if (await fs.pathExists(friendsPath)) {
    friends = await fs.readJSON(friendsPath);
  }

  console.log("friends");
  console.log(friends);

  //Listen for incoming requests to test availability
  listenForConnectionRequests(mykeys, name, initiator, friends, window);
  //Run this code every 15 seconds
  const timerId = setInterval(function () {
    pollIfFriendsOnline(mykeys, name, initiator, window);
  }, 1000 * 15);
  //Package and send a list of the user's friends
  // window.webContents.send("get_all_friends_of_user", friends);

  if (initiator) {
    //Send generated token to client to render
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
  //Code doesnt run below
}

async function registerListeners(window: BrowserWindow) {
  /**
   * This comes from bridge integration, check bridge.ts
   */
  ipcMain.on("send_peer_metadata", (_, message) => {
    console.log(message);
    establishConnection(window, message);
  });
}

async function registerProtocols() {
  app.setAsDefaultProtocolClient("p2p");
}

async function handleInviteLink(url: string, window: BrowserWindow) {
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

//Make window a global variable accessible across

//Declaring global variables to be used across the application
let window: BrowserWindow = null; //TODO: declare this type correctly for TS

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

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
