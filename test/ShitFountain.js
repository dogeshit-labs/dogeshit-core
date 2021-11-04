const ShitFountain = artifacts.require("ShitFountain");
const DogeShit = artifacts.require("DogeShit");
const FakeDoge = artifacts.require("FakeDoge");
const OtherDoge = artifacts.require("OtherDoge");
const ShitLord = artifacts.require("ShitLord");

const { mineBlocks } = require("../utils/testHelpers");

const DEFAULT_ADMIN_ROLE = web3.utils.asciiToHex("0");
const INIT_ROLE = web3.utils.soliditySha3("INIT");

contract("ShitFountain Initialization", async (accounts) => {
  it("Deployer should not have init role", async () =>
    ShitFountain.deployed()
      .then((instance) => instance.hasRole(INIT_ROLE, accounts[0]))
      .then((deployerHasInitRole) => {
        assert.isFalse(deployerHasInitRole, "Deployer still has init role.");
      }));
  it("Deployer should not have admin role", async () =>
    ShitFountain.deployed()
      .then((instance) => instance.hasRole(DEFAULT_ADMIN_ROLE, accounts[0]))
      .then((deployerHasAdminRole) => {
        assert.isFalse(deployerHasAdminRole, "Deployer still has admin role");
      }));
  it("No one should have admin role", async () =>
    ShitFountain.deployed()
      .then((instance) => instance.getRoleMemberCount(DEFAULT_ADMIN_ROLE))
      .then((adminCount) => {
        assert.equal(
          adminCount.valueOf(),
          0,
          "The number of admins was more than 1"
        );
      }));
  it("No one should have init role", async () =>
    ShitFountain.deployed()
      .then((instance) => instance.getRoleMemberCount(INIT_ROLE))
      .then((initCount) => {
        assert.equal(
          initCount.valueOf(),
          0,
          "The number of init accounts was more than 1"
        );
      }));
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
