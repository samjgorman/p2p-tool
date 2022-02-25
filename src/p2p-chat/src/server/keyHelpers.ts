import { createKeys, createHash } from "./crypto";
import { Keys } from "../shared/@types/types";
import * as path from "path";
import fs from "fs-extra";

/**
 * getPublicKeyId is a helper function that creates an encrypted hash for a publicKey
 * and returns it
 * @param publicKey
 * @returns encrypted hash of the given public key: string
 */
export function getPublicKeyId(publicKey: Buffer) {
  return createHash(publicKey).toString("base64");
}

/**
 * generateKeys is a helper function that generates a public and secret key pair,
 * then writes a public.key and secret.key file to the local fs
 * in the form identities/peerIdentity.
 * @param identity
 * @returns the generated public, secret key pair as a Key object type
 */
export async function generateKeys(identity: string): Promise<Keys> {
  const identityPath = path.join(
    __dirname,
    "../../files",
    "identities",
    identity
  );

  await fs.mkdirp(identityPath);
  const publicKeyPath = path.join(identityPath, "public.key");
  const secretKeyPath = path.join(identityPath, "secret.key");
  let me: { publicKey: Buffer; secretKey: Buffer };

  if (!(await fs.pathExists(publicKeyPath))) {
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
