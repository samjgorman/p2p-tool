import { app, BrowserWindow, ipcMain } from "electron";
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
console.log(process.env);
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
  | { type: "box"; from: string; payload: string };

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

async function generateKeys(identity: string): Promise<Keys> {
  //TODO: don't write this to the hidden webpack dir
  const identityPath = path.join(__dirname, "..", "identities", identity);

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
        console.log("Error appending to file" + err);
      }
      // } else {
      //   // Get the file contents after the append operation
      //   console.log(
      //     '\nFile Contents of file after append:',
      //     fs.readFileSync('test.txt', 'utf8')
      //   )
      // }
    });
  }
}

async function buildChatDir(identity: string, name: string): Promise<string> {
  const dirName = identity + "_" + name;
  const chatPath = path.join(__dirname, "..", "chats", dirName);
  await fs.mkdirp(chatPath);

  // const fileName =
  // 	identity + "_" + name + "_" + Date.now().toString() + ".json"
  const fileName = identity + "_" + name + "_" + ".json";

  const chatSessionPath = path.join(chatPath, fileName);

  //If file has not already been created, create it
  if (!(await fs.pathExists(chatSessionPath))) {
    //check if opposite path exists too
    console.log("Generating unique chat file.");
    fs.open(chatSessionPath, "wx", function (err, fd) {
      //Wx flag creates empty file async
      // handle error
      fs.close(fd, function (err) {
        // handle error and close fd
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
  friends: Record<string, string>
) {
  //Get public key of recipient of message
  const publicKey = Buffer.from(friends[name], "base64");
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
          username: "samjgorman@gmail.com",
          credential: "FrogFrog141",
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
      console.log("Wrong person");
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

    //ASYNC or SYNC? IPCMain listener here that waits for updates from the renderer
    ipcMain.on("client_submitted_message", async (event, message) => {
      console.log("Listener fired");
      console.log(message); //Message submitted by client
      const log = formatMessageToStringifiedLog(identity, message); //Check this
      const chatSessionPath = await buildChatDir(identity, name);
      writeToFS(chatSessionPath, log);
      peer.send(message); //Send the client submitted message to the peer
    }); //TODO: check the async callback is allowed...

    //A chat session begins
    // while (true) {
    //   const { message } = await inquirer.prompt([
    //     { type: "input", name: "message", message: "me>" },
    //   ]);
    //   console.log("this is message");
    //   console.log(message);
    //   console.log("this is message.name");
    //   console.log(message.name);

    //   const log = formatMessageToStringifiedLog(identity, message); //Check this
    //   const chatSessionPath = await buildChatDir(identity, name);
    //   writeToFS(chatSessionPath, log);
    //   peer.send(message);
    //   //Send a peer a message, write this message to the local fs
    // }
  });

  //Received new message from sending peer
  peer.on("data", async (data) => {
    console.log(name + ">", data.toString("utf8"));
    //Received message from peer, write this to the local fs
    const log = formatMessageToStringifiedLog(identity, data.toString("utf8")); //Check this
    const chatSessionPath = await buildChatDir(identity, name);
    writeToFS(chatSessionPath, log);
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

// function generateInviteToken(me: Keys): string {
//   // Create an invite payload
//   const password = randomBytes(32);
//   const invite = Buffer.concat([password, me.publicKey]).toString("base64");

//   console.log(`Send this payload:`);
//   console.log(invite);
//   return invite;
// }

//  This function initiates a handshake to connect to a peer
async function initiateHandshake(
  me: Keys, //TODO: better way to pass around keys
  name: string,
  initiator: boolean,
  recipient: string,
  friends: Record<string, string>,
  friendsPath: string
) {
  const password = randomBytes(32);
  const invite = Buffer.concat([password, me.publicKey]).toString("base64");
  // ipcMain.on("generate_token", (event, message) => {
  //   event.sender.send("generate_token", invite);
  // });
  // Create an invite payload
  console.log(`Send this payload to ${recipient}:`);
  console.log(invite);

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

  friends[recipient] = publicKey.toString("base64"); //this should be recipient?
  await fs.writeJSON(friendsPath, friends);

  //Now that encryption matches, attempt to connect
  connect(me, name, recipient, initiator, friends);
}

//  This function accepts a handshake to connect to a peer
async function acceptHandshake(
  me: Keys,
  name: string,
  initiator: boolean,
  invitedBy: string,
  inviteToken: string,
  friends: Record<string, string>,
  friendsPath: string
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

  friends[invitedBy] = publicKey.toString("base64");
  await fs.writeJSON(friendsPath, friends);

  //Now that encryption matches, attempt to connect
  connect(me, name, invitedBy, initiator, friends);
}

declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const createWindow = (): void => {
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
};

//  This begins the webRTC connection process
async function establishConnection(peerMetadata: string) {
  //  Unpack JSON string to an object
  const peerMetadataObj = JSON.parse(peerMetadata);
  const initiator = peerMetadataObj.initiator;
  const name = peerMetadataObj.data.name;

  //Generate keys
  const mykeys = await generateKeys(name);

  // ipcMain.on("generate_token", (event, message) => {
  //   const invite = generateInviteToken(mykeys);
  //   event.sender.send("generate_token", invite);
  // });

  //TODO: refactor
  const identityPath = path.join(__dirname, "..", "identities", name);
  const friendsPath = path.join(identityPath, "friends.json");
  let friends: Record<string, string> = {};
  if (await fs.pathExists(friendsPath)) {
    friends = await fs.readJSON(friendsPath);
  }

  if (initiator) {
    //Send generated token to client to render
    const recipient = peerMetadataObj.data.recipient;
    initiateHandshake(mykeys, name, initiator, recipient, friends, friendsPath);
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
      friendsPath
    );
  }
}

async function registerListeners() {
  /**
   * This comes from bridge integration, check bridge.ts
   */

  //  writeToFS
  // ipcMain.on("string_to_write", (_, message) => {
  //   writeToFS(message);
  //   console.log(message);
  // });

  ipcMain.on("peer_metadata", (_, message) => {
    console.log(message);
    establishConnection(message);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app
  .on("ready", createWindow)
  .whenReady()
  .then(registerListeners)
  .catch((e) => console.error(e));

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.