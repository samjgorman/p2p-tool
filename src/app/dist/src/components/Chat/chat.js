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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var react_1 = __importStar(require("react"));
var chatHistory_1 = __importDefault(require("../ChatHistory/chatHistory"));
var input_1 = __importDefault(require("../ChatInput/input"));
var message_1 = __importDefault(require("../ChatMessage/message"));
/**
 * This component renders a list of live chat messages to be displayed
 * on the web page for the current video.
 * @param props is an object that contains these properties
 *    videoId - id of the YouTube video for which we should get comments from
 *    player - a handle on the player for the video being played
 */
function Chat(props) {
    var _a = (0, react_1.useState)(false), stackPopulated = _a[0], setStackPopulated = _a[1];
    var _b = (0, react_1.useState)([]), messagesToRenderStack = _b[0], setMessagesToRenderStack = _b[1];
    (0, react_1.useEffect)(function () {
        //Listen for submitted messages
        window.Main.on("i_submitted_message", function (event, arg) {
            console.log("Chat object received");
            console.log(event);
            var messageObjToRender = JSON.parse(event);
            var newState = __spreadArray(__spreadArray([], messagesToRenderStack, true), [messageObjToRender], false);
            setMessagesToRenderStack(newState);
            setStackPopulated(true);
        });
        window.Main.on("peer_submitted_message", function (event, arg) {
            console.log("Chat object received from peer");
            console.log(event);
            var messageObjToRender = JSON.parse(event);
            var newState = __spreadArray(__spreadArray([], messagesToRenderStack, true), [messageObjToRender], false);
            setMessagesToRenderStack(newState);
            setStackPopulated(true);
        });
        return function cleanup() {
            window.Main.removeAllListeners("client_submitted_message");
            window.Main.removeAllListeners("peer_submitted_message");
        };
    });
    //TODO: Add a type here...
    return (react_1["default"].createElement("div", { className: "LiveChat" },
        react_1["default"].createElement(chatHistory_1["default"], null),
        stackPopulated &&
            messagesToRenderStack.map(function (chatMessage, i) { return (react_1["default"].createElement(message_1["default"], { key: i, chatMessage: chatMessage.message, timestamp: chatMessage.timestamp, sender: chatMessage.sender })); }),
        react_1["default"].createElement(input_1["default"], null)));
}
exports["default"] = Chat;
//# sourceMappingURL=chat.js.map