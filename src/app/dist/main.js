"use strict";
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
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    electron_1.app.quit();
}
//  This util appends to a file
function writeToFS(message) {
    return __awaiter(this, void 0, void 0, function () {
        var filename;
        return __generator(this, function (_a) {
            filename = "files/new.json";
            if (message.length > 0) {
                fs_extra_1["default"].appendFile(filename, message + "\n", function (err) {
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
var hub = (0, signalhub_1["default"])("p2p-tool", ["http://localhost:8080/"]);
function connect(name, initiatorFlag) {
    var _this = this;
    var peer = new simple_peer_1["default"]({ initiator: initiatorFlag, wrtc: wrtc_1["default"] });
    peer.on("signal", function (data) {
        var payload = {
            type: "signal",
            data: data
        };
        var message = JSON.stringify(payload);
        console.log(name + "signalling");
        console.log(message);
        hub.broadcast("test", message);
    });
    var stream = hub.subscribe("test");
    stream.on("data", function (message) {
        var result = JSON.parse(message);
        if (result.type !== "signal") {
            console.log("wrong payload type");
            return;
        }
        console.log(name + "received data and signalling result data");
        console.log(result.data);
        peer.signal(result.data);
        stream.destroy();
    });
    peer.on("connect", function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("Connected!");
            return [2 /*return*/];
        });
    }); });
    //Received new message from sending peer
    peer.on("data", function (data) {
        console.log(name + ">", data.toString("utf8"));
    });
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
//  This function initiates a handshake to connect to a peer
function initiateHandshake(name, initiator, recipient) {
    return __awaiter(this, void 0, void 0, function () {
        var password;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve) {
                        var stream = hub.subscribe("my_channel"); //  Using name as a temp insecure channel
                        stream.on("data", function (message) {
                            console.log(message);
                            if (message === recipient) {
                                console.log("Password matches");
                                stream.destroy();
                                resolve(message);
                            }
                            else {
                                console.error("wrong invite password");
                            }
                        });
                    })["catch"](function (err) {
                        console.error(err);
                    })];
                case 1:
                    password = _a.sent();
                    hub.broadcast("my_channel", recipient); // Channel name is name, password is recipient
                    connect(name, initiator);
                    return [2 /*return*/];
            }
        });
    });
}
//  This function accepts a handshake to connect to a peer
function acceptHandshake(name, initiator, recipient) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hub.broadcast("my_channel", name);
                    console.log("Sending invite response to", recipient);
                    return [4 /*yield*/, new Promise(function (resolve) {
                            var stream = hub.subscribe("my_channel");
                            stream.on("data", function (message) {
                                if (message === name) {
                                    stream.destroy();
                                    resolve();
                                }
                            });
                        })["catch"](function (err) {
                            console.error(err);
                        })];
                case 1:
                    _a.sent();
                    //  Exchange signal data over signalhub
                    connect(name, initiator);
                    return [2 /*return*/];
            }
        });
    });
}
var createWindow = function () {
    // Create the browser window.
    var mainWindow = new electron_1.BrowserWindow({
        height: 600,
        width: 800,
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
        var peerMetadataObj, initiator, name, recipient;
        return __generator(this, function (_a) {
            peerMetadataObj = JSON.parse(peerMetadata);
            initiator = peerMetadataObj.initiator;
            name = peerMetadataObj.user;
            recipient = peerMetadataObj.recipient;
            // if (initiator) {
            //   initiateHandshake(name, initiator, recipient);
            // } else {
            //   acceptHandshake(name, initiator, recipient);
            // }
            connect(name, initiator);
            return [2 /*return*/];
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
            electron_1.ipcMain.on("string_to_write", function (_, message) {
                writeToFS(message);
                console.log(message);
            });
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