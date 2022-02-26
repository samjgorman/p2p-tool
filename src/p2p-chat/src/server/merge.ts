import * as path from "path";
import fs from "fs-extra";
import chokidar from "chokidar";
import readLastLines from "read-last-lines";

export async function watchFilesInDir(dirPath: string) {
  const watcher = chokidar.watch(dirPath, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
  });

  //Listen for changes to a file...
  // Something to use when events are received.
  const log = console.log.bind(console);
  // Add event listeners.
  watcher
    .on("add", (path) => log(`File ${path} has been added`))
    .on("change", async (path) => {
      log(`File ${path} has been changed`);
      //Get the most recent line changed...
      readLastLines.read(path, 1).then((lines) => {
        console.log(lines);
        //Write this line to the appropriate merge file...
      });
    })

    .on("unlink", (path) => log(`File ${path} has been removed`));
}
