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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
var readline_1 = __importDefault(require("readline"));
var crypto_1 = require("./crypto");
require("dotenv/config");
var onlineOffline_1 = require("./onlineOffline");
//GLOBAL VARS TO TEST
var GLOBAL_USER_NAME;
//Declaring global variables to be used across the application
var window = null; //TODO: declare this type correctly for TS
var CHAT_SESSION_PATH = null;
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
                    identityPath = path.join(__dirname, "../../files", "identities", identity);
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
                        console.error("Error appending to file" + err);
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
            else {
                console.error("Message to write to fs is empty ");
            }
            return [2 /*return*/];
        });
    });
}
function getFriendChatObject(window, message) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function () {
        var friendName, chatHistoryObject, candidateChatPath, fileStream, rl, rl_1, rl_1_1, line, lineObject, e_1_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    friendName = message;
                    chatHistoryObject = [];
                    console.log("Friend name in main" + friendName);
                    if (!(GLOBAL_USER_NAME !== null)) return [3 /*break*/, 17];
                    return [4 /*yield*/, buildChatDir(GLOBAL_USER_NAME, friendName)];
                case 1:
                    candidateChatPath = _b.sent();
                    console.log("Candidate chat path is " + candidateChatPath);
                    return [4 /*yield*/, fs_extra_1["default"].pathExists(candidateChatPath)];
                case 2:
                    if (!_b.sent()) return [3 /*break*/, 15];
                    fileStream = fs_extra_1["default"].createReadStream(candidateChatPath);
                    rl = readline_1["default"].createInterface({
                        input: fileStream,
                        crlfDelay: Infinity
                    });
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 8, 9, 14]);
                    rl_1 = __asyncValues(rl);
                    _b.label = 4;
                case 4: return [4 /*yield*/, rl_1.next()];
                case 5:
                    if (!(rl_1_1 = _b.sent(), !rl_1_1.done)) return [3 /*break*/, 7];
                    line = rl_1_1.value;
                    lineObject = JSON.parse(line);
                    chatHistoryObject.push(lineObject);
                    _b.label = 6;
                case 6: return [3 /*break*/, 4];
                case 7: return [3 /*break*/, 14];
                case 8:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 14];
                case 9:
                    _b.trys.push([9, , 12, 13]);
                    if (!(rl_1_1 && !rl_1_1.done && (_a = rl_1["return"]))) return [3 /*break*/, 11];
                    return [4 /*yield*/, _a.call(rl_1)];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 13: return [7 /*endfinally*/];
                case 14: return [2 /*return*/, chatHistoryObject];
                case 15:
                    console.log("No chat history yet");
                    _b.label = 16;
                case 16: return [3 /*break*/, 18];
                case 17:
                    console.error("Identity not yet established");
                    _b.label = 18;
                case 18: return [2 /*return*/];
            }
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
                    chatPath = path.join(__dirname, "../../files", "chats", dirName);
                    return [4 /*yield*/, fs_extra_1["default"].mkdirp(chatPath)];
                case 1:
                    _a.sent();
                    fileName = identity + "_" + name + ".json";
                    chatSessionPath = path.join(chatPath, fileName);
                    return [4 /*yield*/, fs_extra_1["default"].pathExists(chatSessionPath)];
                case 2:
                    //If file has not already been created, create it
                    if (!(_a.sent())) {
                        //TODO: check if opposite path exists too
                        console.log("Generating unique chat file." + chatSessionPath);
                        fs_extra_1["default"].open(chatSessionPath, "wx", function (err, fd) {
                            //Wx flag creates empty file async
                            console.error(err);
                            fs_extra_1["default"].close(fd, function (err) {
                                console.error(err);
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
function connect(me, identity, name, initiator, friends, window) {
    var _this = this;
    //Get public key of recipient of message
    var publicKey = Buffer.from(friends[name].publicKey, "base64");
    console.log("Public key of recipient");
    console.log(friends[name]);
    var peer = new simple_peer_1["default"]({
        initiator: initiator,
        wrtc: wrtc_1["default"],
        trickle: false,
        config: {
            iceServers: [
                {
                    urls: "stun:numb.viagenie.ca?transport=tcp",
                    username: process.env.STUN_TURN_USER,
                    credential: process.env.STUN_TURN_PASS
                },
                {
                    urls: "turn:numb.viagenie.ca?transport=tcp",
                    username: process.env.STUN_TURN_USER,
                    credential: process.env.STUN_TURN_PASS
                },
            ]
        }
    });
    peer._debug = console.log;
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
            console.error("Wrong person");
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
        var _this = this;
        return __generator(this, function (_a) {
            console.log("Connected!");
            //TODO: Update the last connected key...
            electron_1.ipcMain.on("send_message_to_peer", function (event, message) { return __awaiter(_this, void 0, void 0, function () {
                var log;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log("Listener for writing new data fired");
                            console.log(message); //Message submitted by client
                            log = formatMessageToStringifiedLog(identity, message);
                            return [4 /*yield*/, buildChatDir(identity, name)];
                        case 1:
                            // const chatSessionPath = await buildChatDir(identity, name);
                            CHAT_SESSION_PATH = _a.sent();
                            writeToFS(CHAT_SESSION_PATH, log);
                            peer.send(log); //Send the client submitted message to the peer
                            event.reply("i_submitted_message", log); //Send the message back to the renderer process
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    //Received new message from sending peer
    peer.on("data", function (data) { return __awaiter(_this, void 0, void 0, function () {
        var receivedLog, chatSessionPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    receivedLog = data.toString("utf8");
                    console.log(name + ">", data.toString("utf8"));
                    return [4 /*yield*/, buildChatDir(identity, name)];
                case 1:
                    chatSessionPath = _a.sent();
                    writeToFS(chatSessionPath, receivedLog);
                    window.webContents.send("peer_submitted_message", receivedLog);
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
function generateInviteLink(password, name, me, window) {
    // Create an invite payload
    var invite = Buffer.concat([password, me.publicKey]).toString("base64");
    //Format as a magic link
    var baseUrl = "p2p://";
    var nameParam = "name=" + name;
    var inviteParam = "invite=" + invite;
    var inviteLink = baseUrl + nameParam + "&" + inviteParam;
    console.log("Send this magic link");
    console.log(inviteLink);
    window.webContents.send("send_invite_link", inviteLink);
    return inviteLink;
}
//  This function initiates a handshake to connect to a peer
function initiateHandshake(me, //TODO: better way to pass around keys
name, initiator, recipient, friends, friendsPath, window) {
    return __awaiter(this, void 0, void 0, function () {
        var isPeerOnline, password, inviteLink, publicKey, message, payload, channelMessage, friendMetadata;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, onlineOffline_1.isRemotePeerOnline)(name, recipient)];
                case 1:
                    isPeerOnline = _a.sent();
                    console.log("Res says" + isPeerOnline);
                    password = (0, crypto_1.randomBytes)(32);
                    inviteLink = generateInviteLink(password, name, me, window);
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
                case 2:
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
                    friendMetadata = { publicKey: "", lastSeen: "" };
                    friendMetadata.publicKey = publicKey.toString("base64");
                    console.log("Friend md in initiate" + friendMetadata.publicKey);
                    friends[recipient] = friendMetadata;
                    return [4 /*yield*/, fs_extra_1["default"].writeJSON(friendsPath, friends)];
                case 3:
                    _a.sent();
                    //Package and send a list of the user's friends
                    window.webContents.send("get_all_friends_of_user", friends);
                    //Now that encryption matches, attempt to connect
                    connect(me, name, recipient, initiator, friends, window);
                    return [2 /*return*/];
            }
        });
    });
}
//  This function accepts a handshake to connect to a peer
function acceptHandshake(me, name, initiator, invitedBy, inviteToken, friends, friendsPath, window) {
    return __awaiter(this, void 0, void 0, function () {
        var token, password, publicKey, message, payload, channelMessage, friendMetadata;
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
                    friendMetadata = { publicKey: "", lastSeen: "" };
                    friendMetadata.publicKey = publicKey.toString("base64");
                    console.log("Friend md in initiate" + friendMetadata.publicKey);
                    friends[invitedBy] = friendMetadata;
                    return [4 /*yield*/, fs_extra_1["default"].writeJSON(friendsPath, friends)];
                case 2:
                    _a.sent();
                    //Package and send a list of the user's friends
                    window.webContents.send("get_all_friends_of_user", friends);
                    //Now that encryption matches, attempt to connect
                    connect(me, name, invitedBy, initiator, friends, window);
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
        // backgroundColor: "#191622",
        // backgroundColor: "white",
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
    return mainWindow;
};
//  This begins the webRTC connection process
function establishConnection(window, peerMetadata) {
    return __awaiter(this, void 0, void 0, function () {
        var peerMetadataObj, initiator, name, mykeys, identityPath, friendsPath, friends, timerId, recipient, invitedBy, inviteToken;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    peerMetadataObj = JSON.parse(peerMetadata);
                    initiator = peerMetadataObj.initiator;
                    name = peerMetadataObj.data.name;
                    GLOBAL_USER_NAME = name;
                    return [4 /*yield*/, generateKeys(name)];
                case 1:
                    mykeys = _a.sent();
                    identityPath = path.join(__dirname, "../../files", "identities", name);
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
                    console.log("friends");
                    console.log(friends);
                    //Listen for incoming requests to test availability
                    (0, onlineOffline_1.listenForConnectionRequests)(mykeys, name, initiator, friends, window);
                    timerId = setInterval(function () {
                        (0, onlineOffline_1.pollIfFriendsOnline)(mykeys, name, initiator, window);
                        //Package and send a list of the user's friends
                        window.webContents.send("get_all_friends_of_user", friends);
                    }, 1000 * 15);
                    if (initiator) {
                        recipient = peerMetadataObj.data.recipient;
                        initiateHandshake(mykeys, name, initiator, recipient, friends, friendsPath, window);
                    }
                    else {
                        invitedBy = peerMetadataObj.data.invitedBy;
                        inviteToken = peerMetadataObj.data.inviteToken;
                        acceptHandshake(mykeys, name, initiator, invitedBy, inviteToken, friends, friendsPath, window);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function registerListeners(window) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            /**
             * This comes from bridge integration, check bridge.ts
             */
            electron_1.ipcMain.on("send_peer_metadata", function (_, message) {
                console.log(message);
                establishConnection(window, message);
            });
            electron_1.ipcMain.on("get_friend_chat_object", function (event, message) { return __awaiter(_this, void 0, void 0, function () {
                var chatObject;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log("Request for getting friend chat object registered" + message);
                            return [4 /*yield*/, getFriendChatObject(window, message)];
                        case 1:
                            chatObject = _a.sent();
                            event.reply("friend_chat_object_sent", chatObject);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
function registerProtocols() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            electron_1.app.setAsDefaultProtocolClient("p2p");
            return [2 /*return*/];
        });
    });
}
function handleInviteLink(url, window) {
    return __awaiter(this, void 0, void 0, function () {
        var baseOffset, nameOffset, inviteOffset, urlWithBaseTruncated, splitByParamsUrl, rawNameParam, rawInviteParam, nameParam, inviteParam, connectionConfirmed, mykeys, identityPath, friendsPath, friends, initiator;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    baseOffset = 6;
                    nameOffset = 5;
                    inviteOffset = 7;
                    if (!(url.search("name=") !== -1)) return [3 /*break*/, 10];
                    if (!(url.search("invite=") !== -1)) return [3 /*break*/, 8];
                    urlWithBaseTruncated = url.substring(baseOffset);
                    splitByParamsUrl = urlWithBaseTruncated.split("&");
                    rawNameParam = splitByParamsUrl[0];
                    rawInviteParam = splitByParamsUrl[1];
                    nameParam = rawNameParam.substring(nameOffset);
                    inviteParam = rawInviteParam.substring(inviteOffset);
                    console.log("this is name param" + nameParam);
                    //Pass this name to a frontend confirmation component...
                    window.webContents.send("confirm_connection", nameParam);
                    return [4 /*yield*/, new Promise(function (resolve) {
                            electron_1.ipcMain.on("if_connection_confirmed", function (event, message) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    console.log("received response from connection confirmation " + message);
                                    resolve(message);
                                    return [2 /*return*/];
                                });
                            }); });
                        })];
                case 1:
                    connectionConfirmed = _a.sent();
                    if (!connectionConfirmed) return [3 /*break*/, 6];
                    return [4 /*yield*/, generateKeys(GLOBAL_USER_NAME)];
                case 2:
                    mykeys = _a.sent();
                    identityPath = path.join(__dirname, "../../files", "identities", nameParam);
                    friendsPath = path.join(identityPath, "friends.json");
                    friends = {};
                    return [4 /*yield*/, fs_extra_1["default"].pathExists(friendsPath)];
                case 3:
                    if (!_a.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, fs_extra_1["default"].readJSON(friendsPath)];
                case 4:
                    friends = _a.sent();
                    _a.label = 5;
                case 5:
                    initiator = false;
                    acceptHandshake(mykeys, GLOBAL_USER_NAME, initiator, nameParam, inviteParam, friends, friendsPath, window);
                    return [3 /*break*/, 7];
                case 6:
                    console.log("User decided not to connect.");
                    _a.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    console.error("Url string does not contain name param");
                    _a.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    console.error("Url string does not contain name param");
                    _a.label = 11;
                case 11: return [2 /*return*/];
            }
        });
    });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//Make window a global variable accessible across
electron_1.app
    .on("ready", function () {
    window = createWindow();
    registerProtocols(); //Register protocol routes
    registerListeners(window);
})
    .whenReady()
    .then(function () {
    electron_1.app.on("open-url", function (event, url) {
        event.preventDefault();
        //TODO: rewrite this to send data when app is not open
        handleInviteLink(url, window);
        electron_1.dialog.showErrorBox("Welcome Back", "You arrived from: ".concat(url));
    });
})["catch"](function (e) { return console.error(e); }); //TODO: check this code
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
//# sourceMappingURL=main.js.map