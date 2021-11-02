const ShitFountain = artifacts.require("ShitFountain");
const DogeShit = artifacts.require("DogeShit");
const FakeDoge = artifacts.require("FakeDoge");
const OtherDoge = artifacts.require("OtherDoge");
const ShitLord = artifacts.require("ShitLord");

const { mineBlocks } = require("../utils/testHelpers");

contract("ShitFountain Initialization", async (accounts) => {
  it("Should initially have 9696 dSHT reward per block", async () =>
    ShitFountain.deployed()
      .then((instance) => instance.reward_per_block())
      .then((reward_per_block) => {
        assert.equal(
          reward_per_block.valueOf(),
          9696 * 10 ** 9,
          "The initial reward per block was not 9696 dSHT"
        );
      }));
});
