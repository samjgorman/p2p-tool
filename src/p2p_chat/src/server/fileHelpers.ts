import fs from "fs-extra";
import * as path from "path";

//  This util appends to a file
export async function writeToFS(fileNamePath: string, message: string) {
  if (message.length > 0) {
    fs.appendFile(fileNamePath, message + "\n", (err) => {
      if (err) {
        console.error("Error appending to file" + err);
      }
      // } else {
      //   // Get the file contents after the append operation
      //   console.log(
      //     '\nFile Contents of file after append:',
      //     fs.readFileSync('test.txt', 'utf8')
      //   )
      // }
    });
  } else {
    console.error("Message to write to fs is empty ");
  }
}

export async function buildChatDir(
  identity: string,
  name: string
): Promise<string> {
  const dirName = identity + "_" + name;
  const chatPath = path.join(__dirname, "../../files", "chats", dirName);
  await fs.mkdirp(chatPath);

  const fileName = identity + "_" + name + ".json";

  const chatSessionPath = path.join(chatPath, fileName);

  //If file has not already been created, create it
  if (!(await fs.pathExists(chatSessionPath))) {
    //TODO: check if opposite path exists too
    console.log("Generating unique chat file." + chatSessionPath);
    fs.open(chatSessionPath, "wx", function (err, fd) {
      //Wx flag creates empty file async
      console.error(err);
      fs.close(fd, function (err) {
        console.error(err);
      });
    });
  }
  return chatSessionPath;
}
