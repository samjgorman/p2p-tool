import { app, BrowserWindow, ipcMain, protocol, dialog } from "electron";
import fs from "fs-extra";
import signalhub from "signalhub";

import {
  Keys,
  FriendMetadata,
  PublicChannelMessage,
  PublicChannelMessagePayload,
  InviteResponseMessage,
  InviteAckMessage,
  PeerSignal,
} from "../shared/@types/types";
import {
  getAllFriends,
  getFriendChatObject,
  getFriendsPath,
} from "./offlineChat";
import { connect } from "./connect";

const hub = signalhub("p2p-tool", ["http://localhost:8080/"]);

/**
 * isRemotePeerOnline is a helper function that determines whether a remotePeer is currently online.
 * It accesses the lastSeen property of the given remotePeer in the user's friends file,
 * and if this lastSeen is greater than 15s less than the current date, returns false. Otherwise returns true.
 * @param name
 * @param friend
 * @returns
 */
export async function isRemotePeerOnline(
  name: string,
  friend: string
): Promise<boolean> {
  const friends = await getAllFriends(name);
  let matchFound = false;
  const friendsKeyValuePairs = Object.entries(friends);
  for (const [key, value] of friendsKeyValuePairs) {
    const friendName = key;
    const friendMetadata = value;

    if (friendName == friend) {
      //===
      matchFound = true;
      const lastSeen = friendMetadata.lastSeen;
      //If lastSeen timestamp is 15 seconds less than the current date
      const whenStatusWasLastChecked = Date.now() - 15000;
      if (parseInt(lastSeen) < whenStatusWasLastChecked) {
        return false;
      } else {
        return true;
      }
    }
  }

  return false;
}

/**
 * updateLastSeen updates the lastSeen property of the specified friendName in a user's friends file
 * then sends the updated friends object via IPC to the client
 * @param name
 * @param friendName
 * @param window
 */
export async function updateLastSeen(
  name: string,
  friendName: string,
  window: BrowserWindow
) {
  const friendsPath = await getFriendsPath(name);
  const friends = await getAllFriends(name);

  friends[friendName].lastSeen = Date.now().toString(); //Writing lastSeen to friends
  await fs.writeJSON(friendsPath, friends);

  window.webContents.send("get_all_friends_of_user", friends);
}

/**
 * pollIfFriendsOnline polls if a peer's friends are online. Will be rewritten so currently not documenting.
 * @param me
 * @param name
 * @param initiator
 * @param window
 */
export async function pollIfFriendsOnline(
  me: Keys,
  name: string,
  initiator: boolean,
  window: BrowserWindow
) {
  const friends = await getAllFriends(name);
  console.log("After retrieving friends...");
  console.log(friends);

  const friendsKeyValuePairs = Object.entries(friends);

  for (const [key, value] of friendsKeyValuePairs) {
    console.log(key + ":" + value);
    const friendName = key;
    const friendMetadata = value;
    const publicKey = friendMetadata.publicKey;
    console.log("Polling if " + friendName + " is available");
    //TODO: make a connection via webRTC
    const myInitiator = true; //TODO refactor
    connect(me, name, friendName, myInitiator, friends, window);

    //Listen for an ACK for a set period of time
    // let ackReceived = false;
    // setTimeout(function () {
    //   if (!ackReceived) {
    //     console.log("Ack not received " + friendName + " is offline");
    //     stream.destroy();
    //   }
    // }, 3000);
  }
}

/**
 * listenForConnectionRequests listens for poll requests whether a peer's friends are online.
 * Will be rewritten so currently not documenting.
 * @param me
 * @param name
 * @param initiator
 * @param friends
 * @param window
 */
export async function listenForConnectionRequests(
  me: Keys,
  name: string,
  initiator: boolean,
  friends: Record<string, FriendMetadata>,
  window: BrowserWindow
) {
  //Create peers to listen for each friend that may attempt to connect to me...
  const friendsKeyValuePairs = Object.entries(friends);
  for (const [key, value] of friendsKeyValuePairs) {
    const friendName = key;
    const friendMetadata = value;
    const publicKey = friendMetadata.publicKey;

    const myInitiator = false; //TODO refactor
    connect(me, name, friendName, myInitiator, friends, window);
  }
}
