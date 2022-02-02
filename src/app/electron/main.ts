import { app, BrowserWindow, ipcMain } from 'electron'
import Peer from 'simple-peer'
import wrtc from 'wrtc'
import signalhub from 'signalhub'

const fs = require('fs-extra')

// Temp to write to fs
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

//  This util appends to a file
async function writeToFS(message: string) {
  //  If the message is not null?
  const filename = 'files/new.json' //  make this a param
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

function connect(name: string, initiator: boolean) {
  const peer = new Peer({ initiator, wrtc: wrtc })

  peer.on('signal', data => {
    peer.signal(data)
  })

  //  Connection is successful
  peer.on('connect', () => {
    peer.send('hey peer2, how is it going?')
  })

  peer.on('data', data => {
    console.log('got a message from peer1: ' + data)
  })

  peer.on('close', () => {
    console.log('close')
  })
  peer.on('error', error => {
    console.log('error', error)
  })
  peer.on('end', () => {
    console.log('Disconnected!')
  })
}
//  This function initiates a handshake to connect to a peer
async function initiateHandshake(
  name: string,
  initiator: boolean,
  recipient: string
) {
  const stream = hub.subscribe(name) //  Using name as a temp insecure channel

  await new Promise<void>(resolve => {
    stream.on('data', (message: string) => {
      if (message === recipient) {
        console.log('Password matches')
      } else {
        console.error('wrong invite password')
      }
    })
    resolve()
  })

  hub.broadcast(name, recipient) // Channel name is name, password is recipient
}

//  This function accepts a handshake to connect to a peer
async function acceptHandshake(
  name: string,
  initiator: boolean,
  recipient: string
) {
  hub.broadcast(recipient, name)
  console.log('Sending invite response to', recipient)

  await new Promise<void>(resolve => {
    const stream = hub.subscribe(recipient)
    stream.on('data', (message: string) => {
      if (message === name) {
        stream.destroy()
        resolve()
      }
    })
  })
}
const hub = signalhub('p2p-tool', [
  'https://evening-brook-96941.herokuapp.com/', //  This is a free Heroku instance I've spun up just for us.
  'https://signalhub.herokuapp.com/', //  This is a backup public free Heroku instance.
])

//  This begins the webRTC connection process
async function establishConnection(peerMetadata: string) {
  //  Unpack JSON string to an object
  const peerMetadataObj = JSON.parse(peerMetadata)
  const initiator = peerMetadataObj.initiator
  const name = peerMetadataObj.name
  const recipient = peerMetadataObj.recipient

  if (peerMetadataObj.initiator) {
    initiateHandshake(name, initiator, recipient)
  } else {
    acceptHandshake(name, initiator)
  }
  //  Exchange signal data over signalhub

  connect(name, initiator)
}

async function registerListeners() {
  /**
   * This comes from bridge integration, check bridge.ts
   */

  //  writeToFS
  ipcMain.on('string_to_write', (_, message) => {
    writeToFS(message)
    console.log(message)
  })

  ipcMain.on('peer_metadata', (_, message) => {
    establishConnection(message)
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
