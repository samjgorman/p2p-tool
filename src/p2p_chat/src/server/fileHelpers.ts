import fs from "fs-extra";
import * as path from "path";

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
  const dirName = peer + "_" + remotePeer;
  const chatPath = path.join(__dirname, "../../files", "chats", dirName);
  await fs.mkdirp(chatPath);
  const fileName = peer + "_" + remotePeer + ".json";
  const chatSessionPath = path.join(chatPath, fileName);

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
