import fs from "fs-extra";
import chokidar from "chokidar";
import readLastLines from "read-last-lines";
import * as path from "path";
import { writeToFS, getLengthOfChatGivenFilePath } from "./fileHelpers";
import { BrowserWindow, ipcMain } from "electron";

/**
 * watchFilesInDir handles watching chat files for changes, listens for updates to
 * chat files, then writes these updates to appropriate merged.json files. Called once upon user sign in.
 *
 * The function maintains an internal map of fileNamePaths to fileLength counts,
 * and writes the dif of the currentFileLength - pastFileLength to merged.json.
 * @param dirPath
 */
export async function watchFilesInDir(dirPath: string, window: BrowserWindow) {
  const watcher = chokidar.watch(dirPath, {
    ignored: "**/*merged.json", // ignore dotfiles
    persistent: true,
  });

  //Construct a map of watched fileNamePaths to fileLen counts
  const fileCounts: Map<string, number> = new Map();
  //Listen for changes to a file...
  const log = console.log.bind(console);

  watcher
    .on("add", async (pathName) => {
      log(`File ${pathName} has been added`);
      const fileLen = await getLengthOfChatGivenFilePath(pathName);
      fileCounts[pathName] = fileLen;
    })
    .on("change", async (pathName) => {
      log(`File ${pathName} has been changed`);
      //Get the line count of the changed file
      const currFileLen = await getLengthOfChatGivenFilePath(pathName);
      const pastFileLen = fileCounts[pathName];
      let diff = 1;
      if (currFileLen > pastFileLen) {
        diff = currFileLen - pastFileLen;
      }
      fileCounts[pathName] = currFileLen;

      readLastLines
        .read(pathName, diff)
        .then(async (lines) => {
          console.log(lines.trim());
          const dirName = path.dirname(pathName);
          const mergeFilePath = path.join(
            __dirname,
            "../../",
            dirName,
            "merged.json"
          );
          await writeToFS(mergeFilePath, lines.trim());
          //Notify client that changes exist to rerender...
          const message = "Chat history updated";
          window.webContents.send("send_chat_history", message);
        })

        .catch((err) => {
          console.log(err);
        });
    })

    .on("unlink", (pathName) => log(`File ${pathName} has been removed`));
}
