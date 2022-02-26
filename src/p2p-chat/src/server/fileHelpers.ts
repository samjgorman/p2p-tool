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

export async function populateChatDir(peer: string, remotePeer: string) {
  const chatDirectoryPath = await buildChatD(remotePeer);
  buildMergeFile(remotePeer);
  buildSentFile(peer, remotePeer, chatDirectoryPath);
  buildReceivedFile(peer, remotePeer, chatDirectoryPath);
}

export async function buildChatD(remotePeer: string): Promise<string> {
  const dirName = remotePeer;
  const chatDirPath = path.join(__dirname, "../../files", "chats", dirName);
  await fs.mkdirp(chatDirPath);
  return chatDirPath;
}

export async function buildMergeFile(remotePeer: string): Promise<void> {
  const mergedChatSessionPath = await makeMergedChatSessionPath(remotePeer);
  await createFile(mergedChatSessionPath);
}

export async function buildSentFile(
  peer: string,
  remotePeer: string,
  chatDirectoryPath: string
): Promise<string> {
  const chatSessionPath = await makeChatSessionPath(
    peer,
    remotePeer,
    chatDirectoryPath
  );
  await createFile(chatSessionPath);
  return chatSessionPath;
}

export async function buildReceivedFile(
  peer: string,
  remotePeer: string,
  chatDirectoryPath: string
): Promise<string> {
  const chatSessionPath = await makeChatSessionPath(
    remotePeer,
    peer,
    chatDirectoryPath
  );
  await createFile(chatSessionPath);
  return chatSessionPath;
}

/**
 * makeChatSessionPath is a helper function that makes a
 * chat session path that is created in buildChatDir.
 */
export async function makeChatSessionPath(
  peer: string,
  remotePeer: string,
  chatDirectoryPath: string
): Promise<string> {
  const fileName = peer + "_" + remotePeer + ".json";
  const chatSessionPath = path.join(chatDirectoryPath, fileName);
  return chatSessionPath;
}

export async function getChatSessionPath(
  peer: string,
  remotePeer: string,
  isRemote: boolean
): Promise<string> {
  const chatDirPath = await buildChatD(remotePeer);
  if (isRemote) {
    return makeChatSessionPath(remotePeer, peer, chatDirPath);
  } else {
    return makeChatSessionPath(peer, remotePeer, chatDirPath);
  }
}

export async function makeMergedChatSessionPath(remotePeer: string) {
  const dirName = remotePeer;
  const chatPath = path.join(__dirname, "../../files", "chats", dirName);
  const fileName = "merged.json";
  const mergedChatSessionPath = path.join(chatPath, fileName);
  return mergedChatSessionPath;
}

export async function createFile(filePath: string) {
  if (!(await fs.pathExists(filePath))) {
    console.log("Generating unique file." + filePath);
    try {
      fs.open(filePath, "wx", function (err, fd) {
        // The Wx flag creates an empty file async
        if (!err) {
          fs.close(fd, function (err) {
            // if (err) throw err;
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
  }
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
  const ifRemote = false;
  const chatSessionPath = await getChatSessionPath(peer, remotePeer, ifRemote);
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
  const ifRemote = false;
  const chatSessionPath = await getChatSessionPath(peer, remotePeer, ifRemote);

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
