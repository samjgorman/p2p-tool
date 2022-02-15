"use strict";
exports.__esModule = true;
exports.api = void 0;
var electron_1 = require("electron");
// const fs = require('fs-extra')
exports.api = {
    /**
     * Here you can expose functions to the renderer process
     * so they can interact with the main (electron) side
     * without security problems.
     *
     * The function below can accessed using `window.Main.writeToFS`
     */
    ifConnectionConfirmed: function (message) {
        electron_1.ipcRenderer.send("if_connection_confirmed", message);
    },
    sendInviteLink: function (message) {
        electron_1.ipcRenderer.send("send_invite_link", message);
    },
    sendMessageToPeer: function (message) {
        electron_1.ipcRenderer.send("send_message_to_peer", message);
    },
    sendPeerMetadata: function (peer_metadata) {
        electron_1.ipcRenderer.send("send_peer_metadata", peer_metadata);
    },
    getFriendChatObject: function (friend) {
        electron_1.ipcRenderer.send("get_friend_chat_object", friend);
    },
    // getAllFriendsOfUser: (placeholder: string) => {
    //   ipcRenderer.send("get_all_friends_of_user", placeholder);
    // },
    /**
     * Provide an easier way to listen to events
     */
    on: function (channel, callback) {
        electron_1.ipcRenderer.on(channel, function (_, data) { return callback(data); });
    },
    //Unsubsribe from a channel
    removeAllListeners: function (channel) {
        electron_1.ipcRenderer.removeAllListeners(channel);
    }
};
electron_1.contextBridge.exposeInMainWorld("Main", exports.api);
//# sourceMappingURL=bridge.js.map