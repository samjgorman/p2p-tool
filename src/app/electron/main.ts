import { app, BrowserWindow, ipcMain } from 'electron'
const fs = require('fs-extra')

//Temp to write to fs
// fs.writeFile('test.txt', err => {
//   if (err) {
//     console.error(err)
//     return
//   }
//   //file written successfully
// })

let mainWindow: BrowserWindow | null

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

// const assetsPath =
//   process.env.NODE_ENV === 'production'
//     ? process.resourcesPath
//     : app.getAppPath()

function createWindow() {
  mainWindow = new BrowserWindow({
    // icon: path.join(assetsPath, 'assets', 'icon.png'),
    width: 1100,
    height: 700,
    backgroundColor: '#191622',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

//This util appends to a file
async function writeToFS(message: string) {
  //If the message is not null?
  const filename = 'files/new.json' //make this a param
  if (message.length > 0) {
    fs.appendFile(filename, message + '\n', err => {
      if (err) {
        console.log('Error appending to file' + err)
      }
      // } else {
      //   // Get the file contents after the append operation
      //   console.log(
      //     '\nFile Contents of file after append:',
      //     fs.readFileSync('test.txt', 'utf8')
      //   )
      // }
    })
  }
}
async function registerListeners() {
  /**
   * This comes from bridge integration, check bridge.ts
   */

  //writeToFS
  ipcMain.on('string_to_write', (_, message) => {
    writeToFS(message)
    console.log(message)
  })
}

app
  .on('ready', createWindow)
  .whenReady()
  .then(registerListeners)
  .catch(e => console.error(e))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
