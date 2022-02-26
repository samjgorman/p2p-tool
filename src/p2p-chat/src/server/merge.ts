import fs from "fs-extra";
import chokidar from "chokidar";
import readLastLines from "read-last-lines";
import * as path from "path";
import { writeToFS } from "./fileHelpers";

export async function watchFilesInDir(dirPath: string) {
  const watcher = chokidar.watch(dirPath, {
    // ignored: /(^|[\/\\])\../, // ignore dotfiles
    ignored: "**/*merged.json", // ignore dotfiles
    persistent: true,
  });

  //Listen for changes to a file...
  // Something to use when events are received.
  const log = console.log.bind(console);
  // Add event listeners.
  watcher
    .on("add", (pathName) => log(`File ${pathName} has been added`))
    .on("change", async (pathName) => {
      log(`File ${pathName} has been changed`);
      //Get the most recent line changed...
      readLastLines
        .read(pathName, 1)
        .then(async (lines) => {
          //Get the directory of this path
          const dirName = path.dirname(pathName);
          //Write this line to the appropriate merge file...
          const mergeFilePath = path.join(
            __dirname,
            "../../",
            dirName,
            "merged.json"
          );
          console.log(lines.trim());
          console.log(typeof lines);
          console.log(mergeFilePath);
          await writeToFS(mergeFilePath, lines.trim());
        })

        .catch((err) => {
          console.log(err);
        });
    })

    .on("unlink", (pathName) => log(`File ${pathName} has been removed`));
}
