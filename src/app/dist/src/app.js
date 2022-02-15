"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.App = void 0;
var GlobalStyle_1 = require("./styles/GlobalStyle");
var MainContainer_1 = require("./components/MainContainer");
var react_1 = __importDefault(require("react"));
function App() {
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(GlobalStyle_1.GlobalStyle, null),
        react_1["default"].createElement(MainContainer_1.MainContainer, null)));
}
exports.App = App;
//# sourceMappingURL=App.js.map