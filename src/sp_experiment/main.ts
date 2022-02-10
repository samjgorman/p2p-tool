import signalhub from "signalhub";
import Peer from "simple-peer";
import wrtc from "wrtc";
import inquirer from "inquirer";
import fs from "fs-extra";
import * as path from "path";

import {
  createKeys,
  randomBytes,
  createHash,
  box,
  seal,
  sealOpen,
  boxOpen,
} from "../app/crypto";

function getPublicKeyId(publicKey: Buffer) {
  return createHash(publicKey).toString("base64");
}

type PublicChannelMessage =
  | { type: "seal"; payload: string }
  | { type: "box"; from: string; payload: string };

type PublicChannelMessagePayload =
  | InviteResponseMessage
  | InviteAckMessage
  | PeerSignal;

type InviteResponseMessage = {
  type: "invite";
  password: string;
  publicKey: string;
};

type InviteAckMessage = { type: "invite-ack" };

type PeerSignal = {
  type: "signal";
  data: any;
};

const hub = signalhub("p2p-tool", ["http://localhost:8080/"]);

async function main() {
  async function connect(name: string, initiator: boolean, publicKey: Buffer) {
    // const publicKey = Buffer.from(friends[name], "base64");

    // const publicKey = Buffer.from(friends[name], "base64");

    const peer = new Peer({ initiator, wrtc: wrtc });
    peer._debug = console.log;

    peer.on("signal", function (data) {
      const payload: PeerSignal = {
        type: "signal",
        data: data,
      };
      const message: PublicChannelMessage = {
        type: "box",
        from: getPublicKeyId(me.publicKey),
        payload: box({
          message: Buffer.from(JSON.stringify(payload), "utf8"),
          from: me,
          to: { publicKey },
        }).toString("base64"),
      };
      //   hub.broadcast(getPublicKeyId(publicKey), message);
      hub.broadcast("test", message);
    });

    // const stream = hub.subscribe(getPublicKeyId(me.publicKey));
    const stream = hub.subscribe("test");

    stream.on("data", (message: PublicChannelMessage) => {
      if (message.type !== "box") {
        console.error("Wrong message type");
        return;
      }
      //   if (message.from !== getPublicKeyId(publicKey)) {
      //     console.log("Wrong person");
      //     return;
      //   }
      const result: PublicChannelMessagePayload = JSON.parse(
        boxOpen({
          payload: Buffer.from(message.payload, "base64"),
          from: { publicKey },
          to: me,
        }).toString("utf8")
      );

      if (result.type !== "signal") {
        console.log("wrong payload type");
        return;
      }

      peer.signal(result.data);
      stream.destroy();
    });

    peer.on("connect", async () => {
      console.log("Connected!");

      //A chat session begins
      while (true) {
        const { message } = await inquirer.prompt([
          { type: "input", name: "message", message: "me>" },
        ]);

        peer.send(message);
      }
    });

    //Received new message from sending peer
    peer.on("data", (data) => {
      console.log(">", data.toString("utf8"));
    });
    peer.on("close", () => {
      console.log("close");
    });
    peer.on("error", (error) => {
      console.log("error", error);
    });
    peer.on("end", () => {
      console.log("Disconnected!");
    });
  }

  //   const { name } = await inquirer.prompt([
  //     {
  //       type: "list",
  //       name: "protocol",
  //       message: "What role?",
  //       choices: ["sam", "chet"],
  //     },
  //   ]);

  const { identity } = await inquirer.prompt([
    {
      type: "input",
      name: "identity",
      message: "What identity do you want to use?",
    },
  ]);

  const identityPath = path.join(__dirname, "..", "identities", identity);
  await fs.mkdirp(identityPath);

  const publicKeyPath = path.join(identityPath, "public.key");
  const secretKeyPath = path.join(identityPath, "secret.key");

  let me: { publicKey: Buffer; secretKey: Buffer };
  if (!(await fs.pathExists(publicKeyPath))) {
    console.log("Generating keys.");
    me = createKeys();
    await fs.writeFile(publicKeyPath, me.publicKey);
    await fs.writeFile(secretKeyPath, me.secretKey);
  } else {
    me = {
      publicKey: await fs.readFile(publicKeyPath),

      secretKey: await fs.readFile(secretKeyPath),
    };
  }

  const friendsPath = path.join(identityPath, "friends.json");
  let friends: Record<string, string> = {};
  if (await fs.pathExists(friendsPath)) {
    friends = await fs.readJSON(friendsPath);
  }

  let flag = false;
  if (identity === "sam") {
    flag = true;
  }

  connect(identity, flag, me.publicKey);
}

main();
