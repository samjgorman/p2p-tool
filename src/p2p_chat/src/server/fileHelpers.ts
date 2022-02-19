import fs from "fs-extra";
import * as path from "path";
import readline from "readline";

/**
 * writeToFS is a helper function that writes a message to a fileNamePath.
 * @param fileNamePath
 * @param message
 */
export async function writeToFS(fileNamePath: string, message: string) {
  if (message.length > 0) {
    fs.appendFile(fileNamePath, message + "\n", (err) => {
      if (err) {
        console.error("Error appending to file" + err);
      }
    });
  } else {
    console.error("Message to write to fs is empty ");
  }
}

/**
 * buildChatDir builds a chat directory and a chat file given the user's name and peer's name.
 * The directory is in the form "peer_remotePeer", and files are in the form "peer_remotePeer.json"
 * @param peer
 * @param remotePeer
 * @returns
 */
export async function buildChatDir(
  peer: string,
  remotePeer: string
): Promise<string> {
  const chatSessionPath = await makeChatSessionPath(peer, remotePeer);

  if (!(await fs.pathExists(chatSessionPath))) {
    //TODO: check if opposite path exists too
    console.log("Generating unique chat file." + chatSessionPath);
    fs.open(chatSessionPath, "wx", function (err, fd) {
      // The Wx flag creates an empty file async
      console.error(err);
      fs.close(fd, function (err) {
        console.error(err);
      });
    });
  }
  return chatSessionPath;
}

/**
 * makeChatSessionPath is a helper function that makes a
 * chat session path that is created in buildChatDir.
 */
export async function makeChatSessionPath(
  peer: string,
  remotePeer: string
): Promise<string> {
  const dirName = peer + "_" + remotePeer;
  const chatPath = path.join(__dirname, "../../files", "chats", dirName);
  await fs.mkdirp(chatPath);
  //TODO: Remove random num when done testing
  const fileName = peer + "_" + remotePeer + ".json";
  // + global.testRandomChat.toString() +
  const chatSessionPath = path.join(chatPath, fileName);

  return chatSessionPath;
}

/**
 * getLengthOfChat is a helper function that gets the length
 * of an append-only chat log given a peer & remote peer.
 */
export async function getLengthOfChat(
  peer: string,
  remotePeer: string
): Promise<number> {
  let lineCount = 0;
  const chatSessionPath = await makeChatSessionPath(peer, remotePeer);
  //Read len of file...
  if (await fs.pathExists(chatSessionPath)) {
    const fileStream = fs.createReadStream(chatSessionPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in the file as a single line break.
    for await (const line of rl) {
      lineCount++;
    }
  }

  return lineCount;
}

export function numOfflineMessagesToBeSent(
  numPeerSent: number,
  numRemotePeerReceived: number
): number {
  const dif = numPeerSent - numRemotePeerReceived;
  //If the num of messages the peer has sent is greater
  //than the num of messages the remotePeer has received,
  //the dif is the # of offline messages to send to the remotePeer
  return dif;
}

export async function getChatMessagesSentOffline(
  peer: string,
  remotePeer: string,
  dif: number,
  numPeerSent: number
) {
  const chatSessionPath = await makeChatSessionPath(peer, remotePeer);
  //Get lines from numPeerSent - dif to numPeerSent
  //Ex) numPeerSent = 10, dif = 2, get chat messages from 8 to 10...
  const start = numPeerSent - dif;
  let lineCount = 0;
  const chatHistoryObject: Array<object> = [];

  if (await fs.pathExists(chatSessionPath)) {
    const fileStream = fs.createReadStream(chatSessionPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in the file as a single line break.
    for await (const line of rl) {
      if (lineCount >= start) {
        const lineObject = JSON.parse(line);
        chatHistoryObject.push(lineObject);
      }
      lineCount++;
    }

    return chatHistoryObject;
  }
}
