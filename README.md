# P2P Tool
 P2P Tool is an experimental peer-to-peer chat application.  
 
It supports end-to-end encrypted messaging between two peers exchanging data over webRTC.  Peers authenticate with their public key, where they may invite remote peers with a protocol URL to connect & securely chat.  The tool implements determining whether connected remote peers are offline or online by monitoring the status of attempted webRTC connections.  P2P-Tool is local-first:  identities & chat messages are written to the local filesystem with no external persistence.  
 
P2P tools typically require both peers to be online at the same time in order to exchange information. However, P2P Tool implements a form of offline messaging that keeps track of the difference in length of the two peers' append-only chat logs to deliver any messages received while offline upon going online. 
 
## Features
* End-to-end encrypted messaging
* Data exchanged peer-to-peer with WebRTC
* Local-first: chats & identities written to local filesystem with no third-party persistence
* Send offline messages to remote peers 
* Determines whether connected peers are currently online or offline
* Merge sent and received messages into ordered timeline

## Running in development

Clone the repo & install dependencies with npm install & a reasonably up to date version of node.

````
git clone https://github.com/ccorcos/p2p-tool.git
cd p2p-tool
cd src
cd p2p-chat
npm install
````
If you encounter issues related to wrtc or node-gyp-build when installing, npm uninstalling & installing wrtc and / or ensuring that node-gyp-build is installed will resolve issues in most cases.

## Production
WIP 

## Documentation
Documentation generated from Typedoc is accessible from the docs folder. To generate and or update the documentation, run the following command...

````
npx typedoc
````
Typedoc compilation options are accessible in tsconfig.json under "typedocOptions".


## Notes
This is an experimental tool in active development.  Bugs will likely be present and some degree of unpolish is inevitable.  P2P Tool is not yet recommended for use cases that require verifiably secure communication until the tool is in more development and independently verified. 

## Contributions
The repo was first forked from [p2p-prototype](https://github.com/ccorcos/p2p-prototype).




