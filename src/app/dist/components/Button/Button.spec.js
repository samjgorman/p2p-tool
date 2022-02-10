"use strict";
exports.__esModule = true;
var react_1 = require("@testing-library/react");
var index_1 = require("./index");
test('button should renders', function () {
    var getByText = (0, react_1.render)(React.createElement(index_1.Button, null, "ButtonContent")).getByText;
    expect(getByText('ButtonContent')).toBeTruthy();
    expect(getByText('ButtonContent')).toHaveAttribute('type', 'button');
});
//# sourceMappingURL=Button.spec.js.map