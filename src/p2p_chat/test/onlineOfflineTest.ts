// const assert = require("chai").assert;
import { assert } from "chai";

import {
  pollIfFriendsOnline,
  listenForConnectionRequests,
  isRemotePeerOnline,
} from "../src/server/onlineOffline";

//Test:
describe("isRemotePeerOnline", function () {
  it("Returns false when peer is unknown", async function () {
    const result: boolean = await isRemotePeerOnline(
      "Sam",
      "unknownFriendNotInRecords"
    );
    assert.equal(result, false);
  });
});
