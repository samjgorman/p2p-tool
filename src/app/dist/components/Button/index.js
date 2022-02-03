"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.Button = void 0;
var styles_1 = require("./styles");
function Button(props) {
    return React.createElement(styles_1.Container, __assign({ type: "button" }, props));
}
exports.Button = Button;
//# sourceMappingURL=index.js.map