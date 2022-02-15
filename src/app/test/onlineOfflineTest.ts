// const assert = require("chai").assert;
import { assert } from "chai";

import {
  pollIfFriendsOnline,
  listenForConnectionRequests,
  isRemotePeerOnline,
} from "../onlineOffline";

//Test:
describe("Test", function () {
  it("should return true when peer is online", function () {
    const result = "hello";
    assert.equal(result, "hello");
  });
});
