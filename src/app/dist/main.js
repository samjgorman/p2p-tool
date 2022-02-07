"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var electron_1 = require("electron");
var signalhub_1 = __importDefault(require("signalhub"));
var simple_peer_1 = __importDefault(require("simple-peer"));
var wrtc_1 = __importDefault(require("wrtc"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var path = __importStar(require("path"));
var crypto_1 = require("./crypto");
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    electron_1.app.quit();
}
function getPublicKeyId(publicKey) {
    return (0, crypto_1.createHash)(publicKey).toString("base64");
}
function generateKeys(identity) {
    return __awaiter(this, void 0, void 0, function () {
        var identityPath, publicKeyPath, secretKeyPath, me;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    identityPath = path.join(__dirname, "..", "identities", identity);
                    console.log(identityPath);
                    return [4 /*yield*/, fs_extra_1["default"].mkdirp(identityPath)];
                case 1:
                    _b.sent();
                    publicKeyPath = path.join(identityPath, "public.key");
                    secretKeyPath = path.join(identityPath, "secret.key");
                    return [4 /*yield*/, fs_extra_1["default"].pathExists(publicKeyPath)];
                case 2:
                    if (!!(_b.sent())) return [3 /*break*/, 5];
                    console.log("Generating keys.");
                    me = (0, crypto_1.createKeys)();
                    return [4 /*yield*/, fs_extra_1["default"].writeFile(publicKeyPath, me.publicKey)];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, fs_extra_1["default"].writeFile(secretKeyPath, me.secretKey)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 8];
                case 5:
                    _a = {};
                    return [4 /*yield*/, fs_extra_1["default"].readFile(publicKeyPath)];
                case 6:
                    _a.publicKey = _b.sent();
                    return [4 /*yield*/, fs_extra_1["default"].readFile(secretKeyPath)];
                case 7:
                    me = (_a.secretKey = _b.sent(),
                        _a);
                    _b.label = 8;
                case 8: return [2 /*return*/, me];
            }
        });
    });
}
//  This util appends to a file
function writeToFS(fileNamePath, message) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (message.length > 0) {
                fs_extra_1["default"].appendFile(fileNamePath, message + "\n", function (err) {
                    if (err) {
                        console.log("Error appending to file" + err);
                    }
                    // } else {
                    //   // Get the file contents after the append operation
                    //   console.log(
                    //     '\nFile Contents of file after append:',
                    //     fs.readFileSync('test.txt', 'utf8')
                    //   )
                    // }
                });
            }
            return [2 /*return*/];
        });
    });
}
function buildChatDir(identity, name) {
    return __awaiter(this, void 0, void 0, function () {
        var dirName, chatPath, fileName, chatSessionPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dirName = identity + "_" + name;
                    chatPath = path.join(__dirname, "..", "chats", dirName);
                    return [4 /*yield*/, fs_extra_1["default"].mkdirp(chatPath)];
                case 1:
                    _a.sent();
                    fileName = identity + "_" + name + "_" + ".json";
                    chatSessionPath = path.join(chatPath, fileName);
                    return [4 /*yield*/, fs_extra_1["default"].pathExists(chatSessionPath)];
                case 2:
                    //If file has not already been created, create it
                    if (!(_a.sent())) {
                        //check if opposite path exists too
                        console.log("Generating unique chat file.");
                        fs_extra_1["default"].open(chatSessionPath, "wx", function (err, fd) {
                            //Wx flag creates empty file async
                            // handle error
                            fs_extra_1["default"].close(fd, function (err) {
                                // handle error and close fd
                            });
                        });
                    }
                    return [2 /*return*/, chatSessionPath];
            }
        });
    });
}
function formatMessageToStringifiedLog(identity, message) {
    var log = {
        timestamp: Date.now(),
        sender: identity,
        message: message
    };
    var stringified_log = JSON.stringify(log);
    return stringified_log;
}
var hub = (0, signalhub_1["default"])("p2p-tool", ["http://localhost:8080/"]);
/**
 * Connect
 * @param identity  -> String identity of the sender of the message
 * @param name  -> String Name of the recipient of the message
 * @param initiator -> Bool representing if initiator of the wrtc connection
 */
function connect(me, identity, name, initiator, friends) {
    var _this = this;
    //Get public key of recipient of message
    var publicKey = Buffer.from(friends[name], "base64");
    console.log("Public key of recipient");
    console.log(friends[name]);
    var peer = new simple_peer_1["default"]({ initiator: initiator, wrtc: wrtc_1["default"] });
    peer.on("signal", function (data) {
        var payload = {
            type: "signal",
            data: data
        };
        var message = {
            type: "box",
            from: getPublicKeyId(me.publicKey),
            payload: (0, crypto_1.box)({
                message: Buffer.from(JSON.stringify(payload), "utf8"),
                from: me,
                to: { publicKey: publicKey }
            }).toString("base64")
        };
        hub.broadcast(getPublicKeyId(publicKey), message);
    });
    var stream = hub.subscribe(getPublicKeyId(me.publicKey));
    stream.on("data", function (message) {
        if (message.type !== "box") {
            console.error("Wrong message type");
            return;
        }
        if (message.from !== getPublicKeyId(publicKey)) {
            console.log("Wrong person");
            return;
        }
        var result = JSON.parse((0, crypto_1.boxOpen)({
            payload: Buffer.from(message.payload, "base64"),
            from: { publicKey: publicKey },
            to: me
        }).toString("utf8"));
        if (result.type !== "signal") {
            console.log("wrong payload type");
            return;
        }
        peer.signal(result.data);
        stream.destroy();
    });
    peer.on("connect", function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("Connected!");
            //ASYNC or SYNC? IPCMain listener here that waits for updates from the renderer
            electron_1.ipcMain.on("client_submitted_message", function (event, message) {
                console.log(message); //Message submitted by client
                // const log = formatMessageToStringifiedLog(identity, message); //Check this
                // const chatSessionPath = await buildChatDir(identity, name);
                // writeToFS(chatSessionPath, log);
                // peer.send(message); //Send the client submitted message to the peer
            });
            return [2 /*return*/];
        });
    }); });
    //Received new message from sending peer
    peer.on("data", function (data) { return __awaiter(_this, void 0, void 0, function () {
        var log, chatSessionPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(name + ">", data.toString("utf8"));
                    log = formatMessageToStringifiedLog(identity, data.toString("utf8"));
                    return [4 /*yield*/, buildChatDir(identity, name)];
                case 1:
                    chatSessionPath = _a.sent();
                    writeToFS(chatSessionPath, log);
                    return [2 /*return*/];
            }
        });
    }); });
    peer.on("close", function () {
        console.log("close");
    });
    peer.on("error", function (error) {
        console.log("error", error);
    });
    peer.on("end", function () {
        console.log("Disconnected!");
    });
}
// function generateInviteToken(me: Keys): string {
//   // Create an invite payload
//   const password = randomBytes(32);
//   const invite = Buffer.concat([password, me.publicKey]).toString("base64");
//   console.log(`Send this payload:`);
//   console.log(invite);
//   return invite;
// }
//  This function initiates a handshake to connect to a peer
function initiateHandshake(me, //TODO: better way to pass around keys
name, initiator, recipient, friends, friendsPath) {
    return __awaiter(this, void 0, void 0, function () {
        var password, invite, publicKey, message, payload, channelMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    password = (0, crypto_1.randomBytes)(32);
                    invite = Buffer.concat([password, me.publicKey]).toString("base64");
                    // ipcMain.on("generate_token", (event, message) => {
                    //   event.sender.send("generate_token", invite);
                    // });
                    // Create an invite payload
                    console.log("Send this payload to ".concat(recipient, ":"));
                    console.log(invite);
                    return [4 /*yield*/, new Promise(function (resolve) {
                            var stream = hub.subscribe(getPublicKeyId(me.publicKey));
                            stream.on("data", function (message) {
                                if (message.type === "seal") {
                                    var data = (0, crypto_1.sealOpen)({
                                        payload: Buffer.from(message.payload, "base64"),
                                        to: me
                                    });
                                    var result = JSON.parse(data.toString("utf8"));
                                    if (result.type === "invite") {
                                        if (result.password === password.toString("base64")) {
                                            console.log("Passwords match");
                                            stream.destroy();
                                            resolve(Buffer.from(result.publicKey, "base64"));
                                        }
                                        else {
                                            console.error("wrong invite password");
                                        }
                                    }
                                    else {
                                        console.error("wrong public channel payload type");
                                    }
                                }
                                else {
                                    console.error("wrong public channel message type");
                                }
                            });
                        })];
                case 1:
                    publicKey = _a.sent();
                    message = {
                        type: "invite-ack"
                    };
                    payload = (0, crypto_1.box)({
                        message: Buffer.from(JSON.stringify(message), "utf8"),
                        from: me,
                        to: { publicKey: publicKey }
                    });
                    channelMessage = {
                        type: "box",
                        from: getPublicKeyId(me.publicKey),
                        payload: payload.toString("base64")
                    };
                    hub.broadcast(getPublicKeyId(publicKey), channelMessage);
                    friends[recipient] = publicKey.toString("base64"); //this should be recipient?
                    return [4 /*yield*/, fs_extra_1["default"].writeJSON(friendsPath, friends)];
                case 2:
                    _a.sent();
                    //Now that encryption matches, attempt to connect
                    connect(me, name, recipient, initiator, friends);
                    return [2 /*return*/];
            }
        });
    });
}
//  This function accepts a handshake to connect to a peer
function acceptHandshake(me, name, initiator, invitedBy, inviteToken, friends, friendsPath) {
    return __awaiter(this, void 0, void 0, function () {
        var token, password, publicKey, message, payload, channelMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = Buffer.from(inviteToken.trim(), "base64");
                    password = token.slice(0, 32).toString("base64");
                    publicKey = token.slice(32);
                    message = {
                        type: "invite",
                        password: password,
                        publicKey: me.publicKey.toString("base64")
                    };
                    payload = (0, crypto_1.seal)({
                        message: Buffer.from(JSON.stringify(message), "utf8"),
                        to: { publicKey: publicKey }
                    });
                    channelMessage = {
                        type: "seal",
                        payload: payload.toString("base64")
                    };
                    console.log("Sending invite response to", invitedBy);
                    hub.broadcast(getPublicKeyId(publicKey), channelMessage);
                    return [4 /*yield*/, new Promise(function (resolve) {
                            var stream = hub.subscribe(getPublicKeyId(me.publicKey));
                            stream.on("data", function (message) {
                                if (message.type === "box") {
                                    if (message.from === getPublicKeyId(publicKey)) {
                                        var data = (0, crypto_1.boxOpen)({
                                            payload: Buffer.from(message.payload, "base64"),
                                            from: { publicKey: publicKey },
                                            to: me
                                        });
                                        var result = JSON.parse(data.toString("utf8"));
                                        if (result.type === "invite-ack") {
                                            console.log("Void promise resolved");
                                            stream.destroy();
                                            resolve();
                                        }
                                        else {
                                            console.error("wrong payload type");
                                        }
                                    }
                                    else {
                                        console.error("message from the wrong person");
                                    }
                                }
                                else {
                                    console.error("wrong public channel message type");
                                }
                            });
                        })];
                case 1:
                    _a.sent();
                    friends[invitedBy] = publicKey.toString("base64");
                    return [4 /*yield*/, fs_extra_1["default"].writeJSON(friendsPath, friends)];
                case 2:
                    _a.sent();
                    //Now that encryption matches, attempt to connect
                    connect(me, name, invitedBy, initiator, friends);
                    return [2 /*return*/];
            }
        });
    });
}
var createWindow = function () {
    // Create the browser window.
    var mainWindow = new electron_1.BrowserWindow({
        width: 1100,
        height: 700,
        backgroundColor: "#191622",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
        }
    });
    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};
//  This begins the webRTC connection process
function establishConnection(peerMetadata) {
    return __awaiter(this, void 0, void 0, function () {
        var peerMetadataObj, initiator, name, mykeys, identityPath, friendsPath, friends, recipient, invitedBy, inviteToken;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    peerMetadataObj = JSON.parse(peerMetadata);
                    initiator = peerMetadataObj.initiator;
                    name = peerMetadataObj.data.name;
                    return [4 /*yield*/, generateKeys(name)];
                case 1:
                    mykeys = _a.sent();
                    identityPath = path.join(__dirname, "..", "identities", name);
                    friendsPath = path.join(identityPath, "friends.json");
                    friends = {};
                    return [4 /*yield*/, fs_extra_1["default"].pathExists(friendsPath)];
                case 2:
                    if (!_a.sent()) return [3 /*break*/, 4];
                    return [4 /*yield*/, fs_extra_1["default"].readJSON(friendsPath)];
                case 3:
                    friends = _a.sent();
                    _a.label = 4;
                case 4:
                    if (initiator) {
                        recipient = peerMetadataObj.data.recipient;
                        initiateHandshake(mykeys, name, initiator, recipient, friends, friendsPath);
                    }
                    else {
                        invitedBy = peerMetadataObj.data.invitedBy;
                        inviteToken = peerMetadataObj.data.inviteToken;
                        acceptHandshake(mykeys, name, initiator, invitedBy, inviteToken, friends, friendsPath);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function registerListeners() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            /**
             * This comes from bridge integration, check bridge.ts
             */
            //  writeToFS
            // ipcMain.on("string_to_write", (_, message) => {
            //   writeToFS(message);
            //   console.log(message);
            // });
            electron_1.ipcMain.on("peer_metadata", function (_, message) {
                console.log(message);
                establishConnection(message);
            });
            return [2 /*return*/];
        });
    });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app
    .on("ready", createWindow)
    .whenReady()
    .then(registerListeners)["catch"](function (e) { return console.error(e); });
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
//# sourceMappingURL=main.js.map