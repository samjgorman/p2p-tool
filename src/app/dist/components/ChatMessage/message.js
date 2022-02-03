"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var react_1 = __importDefault(require("react"));
/**
 * This component renders a single message and should be used as a
 * child component to LiveChat.
 * @param props is an object that contains these properties
 *    LiveChatMessage - an object that contains these properties
 *      timestamp - a Date object representing when the message was sent
 *      text - a string containing the message's text
 *      time_posted - an object containing these properties
 *          seconds - time posted in UNIX timestamp seconds
 */
function ChatMessage(props) {
    return (react_1["default"].createElement("div", { className: "LiveChatMessage" },
        react_1["default"].createElement("h4", { className: "message-owner" }, props.liveChatMessage.username),
        react_1["default"].createElement("div", { className: "UserAndText" },
            react_1["default"].createElement("p", { className: "message-text" }, props.text))));
}
exports["default"] = ChatMessage;
//# sourceMappingURL=message.js.map