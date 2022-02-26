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
 *
 * @param peer populateChatDir is a helper function that populates a chat directory
 * with a sent append-only message log, received append-only message log, and a merged.json append-only
 * message log of the two logs.  Called upon successful establishment of a connection in connect()
 * @param remotePeer
 */
export async function populateChatDir(peer: string, remotePeer: string) {
  const chatDirectoryPath = await buildChatD(remotePeer);
  buildMergeFile(remotePeer);
  buildSentFile(peer, remotePeer, chatDirectoryPath);
  buildReceivedFile(peer, remotePeer, chatDirectoryPath);
}

/**
 * buildChatD is a simple helper function that builds a chat directory given the name of a remotePeer
 * to name the folder to.
 * @param remotePeer
 * @returns
 */
export async function buildChatD(remotePeer: string): Promise<string> {
  const dirName = remotePeer;
  const chatDirPath = path.join(__dirname, "../../files", "chats", dirName);
  await fs.mkdirp(chatDirPath);
  return chatDirPath;
}

/**
 * buildMergeFile is a simple helper function that creates a merged.json file.
 * @param remotePeer
 */
export async function buildMergeFile(remotePeer: string): Promise<void> {
  const mergedChatSessionPath = await makeMergedChatSessionPath(remotePeer);
  await createFile(mergedChatSessionPath);
}

/**
 * buildSentFile is a simple helper function that creates a sent append-only log
 * named in the form peer_remotePeer.json
 * @param peer
 * @param remotePeer
 * @param chatDirectoryPath
 * @returns a valid file path
 */
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

/**
 * buildSentFile is a simple helper function that creates a received append-only log
 * named in the form remotePeer_peer.json
 * @param peer
 * @param remotePeer
 * @param chatDirectoryPath
 * @returns a valid file path
 */
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

/**
 * getSentChatSessionPath is a helper function
 * that gets the sent chat file path given a
 * peer and remote peer.
 * @param peer
 * @param remotePeer
 * @returns
 */
export async function getSentChatSessionPath(
  peer: string,
  remotePeer: string
): Promise<string> {
  const chatDirPath = await buildChatD(remotePeer);
  return makeChatSessionPath(peer, remotePeer, chatDirPath);
}

/**
 * getSentChatSessionPath is a helper function
 * that gets the received chat file path given a
 * peer and remote peer.
 * @param peer
 * @param remotePeer
 * @returns
 */
export async function getReceivedChatSessionPath(
  peer: string,
  remotePeer: string
): Promise<string> {
  const chatDirPath = await buildChatD(remotePeer);
  return makeChatSessionPath(remotePeer, peer, chatDirPath);
}

//Given a directory, gets the
export async function makeMergedChatSessionPath(remotePeer: string) {
  const dirName = remotePeer;
  const chatPath = path.join(__dirname, "../../files", "chats", dirName);
  const fileName = "merged.json";
  const mergedChatSessionPath = path.join(chatPath, fileName);
  return mergedChatSessionPath;
}

/**
 * createFile is a general helper function that creates a file given a filepath,
 * with appropriate error-checking to avoid throwing an exception when the file
 * has already been created.
 * @param filePath
 */
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
 * getLengthOfSentChat is a helper function that gets the length
 * of the append-only sent messages chat log given a peer and remote peer
 * @param peer
 * @param remotePeer
 * @returns length of file as a number
 */
export async function getLengthOfSentChat(
  peer: string,
  remotePeer: string
): Promise<number> {
  const chatSessionPath = await getSentChatSessionPath(peer, remotePeer);
  const fileLen = await getLengthOfChatGivenFilePath(chatSessionPath);
  return fileLen;
}

/**
 * getLengthOfReceivedChat is a helper function that gets the length
 * of the append-only received messages chat log given a peer and remote peer
 * @param peer
 * @param remotePeer
 * @returns length of file as a number
 */
export async function getLengthOfReceivedChat(
  peer: string,
  remotePeer: string
): Promise<number> {
  const chatSessionPath = await getReceivedChatSessionPath(peer, remotePeer);
  const fileLen = await getLengthOfChatGivenFilePath(chatSessionPath);
  return fileLen;
}

export async function getLengthOfChatGivenFilePath(filePath: string) {
  let lineCount = 0;

  if (await fs.pathExists(filePath)) {
    const fileStream = fs.createReadStream(filePath);
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

/**
 * numOfflineMessagesToBeSent is a simple helper function that computes the dif between the
 * number of messages the peer has sent and and the number of messages the remote peer has received.
 *
 * If the num of messages the peer has sent is greater
 * than the num of messages the remotePeer has received,
 * the dif is the # of offline messages to send to the remotePeer
 * @param numPeerSent
 * @param numRemotePeerReceived
 * @returns
 */
export function numOfflineMessagesToBeSent(
  numPeerSent: number,
  numRemotePeerReceived: number
): number {
  const dif = numPeerSent - numRemotePeerReceived;
  return dif;
}

/**
 * getChatMessagesSentOffline is a helper function that gets the chat message objects
 * that were sent by a peer offline to a remote peer. It does so by reading the peer's
 * sent messages log from a given start, end range. The function starts reading at numPeerSent - dif,
 * and ends reading until the end of the file.
 * @param peer
 * @param remotePeer
 * @param dif
 * @param numPeerSent
 * @returns
 */
export async function getChatMessagesSentOffline(
  peer: string,
  remotePeer: string,
  dif: number,
  numPeerSent: number
) {
  const chatSessionPath = await getSentChatSessionPath(peer, remotePeer);
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
