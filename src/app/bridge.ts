import { contextBridge, ipcRenderer } from "electron";
// const fs = require('fs-extra')

export const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.writeToFS`
   */

  ifConnectionConfirmed: (message: boolean) => {
    ipcRenderer.send("if_connection_confirmed", message);
  },

  sendInviteLink: (message: string) => {
    ipcRenderer.send("send_invite_link", message);
  },

  sendMessageToPeer: (message: string) => {
    ipcRenderer.send("send_message_to_peer", message);
  },

  sendPeerMetadata: (peer_metadata: string) => {
    ipcRenderer.send("send_peer_metadata", peer_metadata);
  },

  // getAllFriendsOfUser: (placeholder: string) => {
  //   ipcRenderer.send("get_all_friends_of_user", placeholder);
  // },

  /**
   * Provide an easier way to listen to events
   */
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data));
  },

  //Unsubsribe from a channel

  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
};

contextBridge.exposeInMainWorld("Main", api);
