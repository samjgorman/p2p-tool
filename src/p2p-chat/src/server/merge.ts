import fs from "fs-extra";
import chokidar from "chokidar";
import readLastLines from "read-last-lines";
import * as path from "path";
import { writeToFS, getLengthOfChatGivenFilePath } from "./fileHelpers";

export async function watchFilesInDir(dirPath: string) {
  const watcher = chokidar.watch(dirPath, {
    // ignored: /(^|[\/\\])\../, // ignore dotfiles
    ignored: "**/*merged.json", // ignore dotfiles
    persistent: true,
    usePolling: true,
    interval: 50, //default is 100
  });

  //Construct a map of watched fileNamePaths to fileLen counts
  const fileCounts = new Map();
  //Listen for changes to a file...
  const log = console.log.bind(console);
  // Add event listeners.
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

      //Get the most recent line changed...
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
        })

        .catch((err) => {
          console.log(err);
        });
    })

    .on("unlink", (pathName) => log(`File ${pathName} has been removed`));
}
