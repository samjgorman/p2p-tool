"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.Greetings = void 0;
var styles_1 = require("./styles");
var input_1 = __importDefault(require("../ChatInput/input"));
var connect_1 = __importDefault(require("../Connect/connect"));
var react_1 = __importDefault(require("react"));
function Greetings() {
    return (react_1["default"].createElement(styles_1.Container, null,
        react_1["default"].createElement(styles_1.Text, null, "Demo of a p2p chat application"),
        react_1["default"].createElement(connect_1["default"], null),
        react_1["default"].createElement(input_1["default"], null)));
}
exports.Greetings = Greetings;
//# sourceMappingURL=index.js.map