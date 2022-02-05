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
    sendInviteToken: function (val) {
        electron_1.ipcRenderer.send("generate_token");
    },
    writeToFs: function (string_to_write) {
        // console.log("I'll write to the fs one day!" + string_to_write)
        electron_1.ipcRenderer.send("string_to_write", string_to_write);
    },
    passPeerMetadata: function (peer_metadata) {
        electron_1.ipcRenderer.send("peer_metadata", peer_metadata);
    },
    /**
     * Provide an easier way to listen to events
     */
    on: function (channel, callback) {
        electron_1.ipcRenderer.on(channel, function (_, data) { return callback(data); });
    }
};
electron_1.contextBridge.exposeInMainWorld("Main", exports.api);
//# sourceMappingURL=bridge.js.map