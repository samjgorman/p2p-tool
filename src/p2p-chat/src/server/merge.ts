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
    usePolling: true,
    interval: 1, //default is 100
  });

  //Listen for changes to a file...
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
