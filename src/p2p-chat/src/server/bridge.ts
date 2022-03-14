import { contextBridge, ipcRenderer } from "electron";

/**
 * Here, functions are exposed to the renderer process
 * via a contextBridge so they can interact with the
 * main (electron) side without security problems.
 * The function below can accessed using `window.Main.writeToFS`
 */
export const api = {
  ifConnectionConfirmed: (message: boolean) => {
    ipcRenderer.send("if_connection_confirmed", message);
  },

  sendInviteLink: (message: string) => {
    ipcRenderer.send("send_invite_link", message);
  },

  sendMessageToPeer: (message: string) => {
    ipcRenderer.send("send_message_to_peer", message);
  },

  sendOfflineMessageToPeer: (message: string) => {
    ipcRenderer.send("send_offline_message_to_peer", message);
  },

  sendPeerMetadata: (peer_metadata: string) => {
    ipcRenderer.send("send_peer_metadata", peer_metadata);
  },

  attemptToSendToPeer: (message: string) => {
    ipcRenderer.send("attempt_to_send_online_message_to_peer", message);
  },
  getChatHistory: (friendName: string) => {
    ipcRenderer.send("get_chat_history", friendName);
  },

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
