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
exports.__esModule = true;
var react_1 = __importStar(require("react"));
function handleConnectInfo(event) {
    return __awaiter(this, void 0, void 0, function () {
        var initiatorString, initiator, data, recipient, invitedBy, inviteToken, rawPeerMetadata, peerMetadata;
        return __generator(this, function (_a) {
            console.log(event.target[0].value);
            console.log(event.target[1].value);
            initiatorString = event.target[1].value;
            initiator = false;
            data = {
                name: event.target[0].value
            };
            if (initiatorString === "send") {
                initiator = true;
                recipient = event.target[2].value //Recipient
                ;
                data["recipient"] = recipient;
                //Schema: 
            }
            else {
                invitedBy = event.target[2].value;
                inviteToken = event.target[3].value;
                data["invitedBy"] = invitedBy;
                data["inviteToken"] = inviteToken;
            }
            rawPeerMetadata = {
                initiator: initiator,
                data: data
            };
            peerMetadata = JSON.stringify(rawPeerMetadata);
            window.Main.passPeerMetadata(peerMetadata);
            return [2 /*return*/];
        });
    });
}
/**
 * This component renders a single comment and should be used as a
 * child component to CommentLog.
 *  * @param props is an object that contains these properties
 *
**/
function Connect() {
    var _a = (0, react_1.useState)(false), initiator = _a[0], setInitiator = _a[1];
    var _b = (0, react_1.useState)(0), token = _b[0], setToken = _b[1];
    function handleChoice(val) {
        if (val === "send") {
            setInitiator(true);
            window.Main.sendInviteToken("Requested token");
        }
        if (val === "accept") {
            setInitiator(false);
        }
    }
    (0, react_1.useEffect)(function () {
        // Listen for the event
        //Find way to listen for API
        window.Main.on("generate_token", function (event, val) {
            setToken(val);
        });
    }, []);
    return (react_1["default"].createElement("div", { className: "LiveChatMessageForm" },
        react_1["default"].createElement("div", null, "Begin a p2p connection"),
        react_1["default"].createElement("form", { className: "liveChat-message-form", autoComplete: "off", onSubmit: function (event) {
                return handleConnectInfo(event);
            } },
            react_1["default"].createElement("input", { className: "username-field", placeholder: "Choose a username", required: true }),
            react_1["default"].createElement("select", { name: "role", id: "role-select", onChange: function (e) { return handleChoice(e.target.value); }, required: true },
                react_1["default"].createElement("option", { value: "" }, "--Please choose an option--"),
                react_1["default"].createElement("option", { value: "send" }, "Send an invite"),
                react_1["default"].createElement("option", { value: "accept", onSelect: function () { return setInitiator(false); } }, " Accept an invite")),
            initiator == true &&
                react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement("input", { className: "initiator-field", placeholder: "Who are you inviting?", required: true })),
            initiator == false &&
                react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement("input", { className: "ninitiator-field", placeholder: "Who are you accepting this invite from?", required: true }),
                    react_1["default"].createElement("input", { className: "token-field", placeholder: "What's the invite token?", required: true })),
            react_1["default"].createElement("input", { className: "submit-connection-button", type: "submit", value: "Send" })),
        initiator &&
            react_1["default"].createElement("div", null,
                "Send this payload: ",
                token,
                " ")));
}
exports["default"] = Connect;
//# sourceMappingURL=connect.js.map