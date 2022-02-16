import { app, BrowserWindow, ipcMain, protocol, dialog } from "electron";
import fs from "fs-extra";
import * as path from "path";
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

const hub = signalhub("p2p-tool", ["http://localhost:8080/"]);

//Util to determine if peer
export async function isRemotePeerOnline(
  name: string,
  friend: string
): Promise<boolean> {
  //Compare to the current date
  //TODO: have a "get friends" function
  const identityPath = path.join(__dirname, "../../files", "identities", name);
  const friendsPath = path.join(identityPath, "friends.json");
  let friends: Record<string, FriendMetadata> = {}; //may need an array
  if (await fs.pathExists(friendsPath)) {
    friends = await fs.readJSON(friendsPath);
  }

  let matchFound = false;
  const friendsKeyValuePairs = Object.entries(friends); //get key value pairs
  for (const [key, value] of friendsKeyValuePairs) {
    const friendName = key;
    // const publicKey = value;
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

export async function updateLastSeen(
  name: string,
  friendName: string,
  window: BrowserWindow
) {
  //TODO: write this last_seen to file...
  const identityPath = path.join(__dirname, "../../files", "identities", name);
  const friendsPath = path.join(identityPath, "friends.json");
  let friends: Record<string, FriendMetadata> = {}; //may need an array

  if (await fs.pathExists(friendsPath)) {
    friends = await fs.readJSON(friendsPath);
  }
  // const friendMetadata: FriendMetadata = friends[friendName];
  friends[friendName].lastSeen = Date.now().toString();

  await fs.writeJSON(friendsPath, friends);

  window.webContents.send("get_all_friends_of_user", friends);
}

export async function pollIfFriendsOnline(
  me: Keys,
  name: string,
  initiator: boolean,
  window: BrowserWindow
) {
  //From a user's name, search for their JSON file and read it...
  const identityPath = path.join(__dirname, "../../files", "identities", name);
  const friendsPath = path.join(identityPath, "friends.json");
  let friends: Record<string, FriendMetadata> = {}; //may need an array

  if (await fs.pathExists(friendsPath)) {
    friends = await fs.readJSON(friendsPath);
  }
  console.log("After retrieving friends...");
  console.log(friends);

  //Now, write the contents of the friends object to the lastSeenFriends
  const friendsKeyValuePairs = Object.entries(friends); //get key value pairs

  for (const [key, value] of friendsKeyValuePairs) {
    console.log(key + ":" + value);
    //Given the key and value, attempt to connect to the peer and report its status
    const friendName = key;
    const friendMetadata = value;
    const publicKey = friendMetadata.publicKey; //Now that encryption matches, attempt to connect to each peer in the list
    console.log("Polling if " + friendName + " is available");

    const channelMessage: PublicChannelMessage = {
      type: "syn",
      from: me.publicKey.toString("base64"),
      payload: "This is a test", //TODO: refactor this...
    };

    //TODO: Encrypt this message
    hub.broadcast(publicKey + "invite", channelMessage); //Broadcast to public key of peer we are testing
    const stream = hub.subscribe(me.publicKey.toString("base64") + "ack"); //Subscribe to your own public key

    //Listen for an ACK for a set period of time
    let ackReceived = false;
    setTimeout(function () {
      if (!ackReceived) {
        // show notification that event has not been fired
        console.log("Ack not received " + friendName + " is offline");
        stream.destroy();
      }
    }, 3000);

    stream.on("data", (message: PublicChannelMessage) => {
      console.log("Message received back from connection listener");

      if (message.type === "syn-ack") {
        if (message.from == publicKey) {
          //===
          console.log(
            "Ack received from remote peer," + friendName + " is online "
          );
          ackReceived = true;
          updateLastSeen(name, friendName, window);

          stream.destroy();
        } else {
          console.error("Syn ack received is not from the intended peer");
        }
      } else {
        console.error("Message type response is not valid");
      }
    });
  }
}

//Listener that opens a peer object with initiator off
export async function listenForConnectionRequests(
  me: Keys,
  name: string,
  initiator: boolean,
  friends: Record<string, FriendMetadata>,
  window: BrowserWindow
) {
  const inviteAck: InviteAckMessage = {
    type: "invite-ack",
  };

  const channelMessage: PublicChannelMessage = {
    type: "syn-ack",
    from: me.publicKey.toString("base64"),
    payload: JSON.stringify(inviteAck),
  };

  //Subscribe to hub of my own public key
  //TODO: Encrypt this message
  const stream = hub.subscribe(me.publicKey.toString("base64") + "invite"); //Check the iD here
  const friendsKeyValuePairs = Object.entries(friends); //get key value pairs

  stream.on("data", (message: PublicChannelMessage) => {
    console.log("Message received from connection listener");
    if (message.type === "syn") {
      let matchFound = false;
      for (const [key, value] of friendsKeyValuePairs) {
        const friendName = key;
        // const publicKey = value;
        const friendMetadata = value;
        const publicKey = friendMetadata.publicKey;

        if (message.from === publicKey) {
          //===
          console.log(
            "Match found from " + friendName + " connection listener"
          );
          matchFound = true;
          //Sent an ACK to the sender's public key
          hub.broadcast(message.from + "ack", channelMessage);
          // stream.destroy();
        }
      }

      if (!matchFound) {
        console.error(
          "message from a person not in the user's friend.json " + message.from
        );
      }
    } else {
      console.error("wrong public channel message type" + message.type);
    }
  });
}
