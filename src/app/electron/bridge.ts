import { contextBridge, ipcRenderer } from 'electron'
// const fs = require('fs-extra')

export const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.sendMessage`
   */

  // sendMessage: (message: string) => {
  //   ipcRenderer.send('message', message)
  // },

  writeToFs: (string_to_write: string) => {
    // console.log("I'll write to the fs one day!" + string_to_write)
    ipcRenderer.send('string_to_write', string_to_write)
  },

  /**
   * Provide an easier way to listen to events
   */
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  },
}

contextBridge.exposeInMainWorld('Main', api)
