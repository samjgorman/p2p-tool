import {
  createKeys,
  randomBytes,
  createHash,
  box,
  seal,
  sealOpen,
  boxOpen,
} from "./crypto";
import {
  Keys,
  FriendMetadata,
  PublicChannelMessage,
  PublicChannelMessagePayload,
  InviteResponseMessage,
  InviteAckMessage,
  PeerSignal,
} from "../shared/@types/types";
import * as path from "path";
import fs from "fs-extra";

export function getPublicKeyId(publicKey: Buffer) {
  return createHash(publicKey).toString("base64");
}

export async function generateKeys(identity: string): Promise<Keys> {
  const identityPath = path.join(
    __dirname,
    "../../files",
    "identities",
    identity
  );

  console.log(identityPath);
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

  return me;
}
