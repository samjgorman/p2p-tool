"use strict";
exports.__esModule = true;
var react_1 = require("@testing-library/react");
var index_1 = require("./index");
test('Greetings should renders', function () {
    var _a = (0, react_1.render)(React.createElement(index_1.Greetings, null)), getByText = _a.getByText, getByAltText = _a.getByAltText;
    expect(getByText('An Electron boilerplate including TypeScript, React, Jest and ESLint.')).toBeTruthy();
    expect(getByAltText('ReactJS logo')).toBeTruthy();
});
//# sourceMappingURL=Greetings.spec.js.map