const ShitLord = artifacts.require("ShitLord");
const DogeShit = artifacts.require("DogeShit");
const FakeDoge = artifacts.require("FakeDoge");

const DEFAULT_ADMIN_ROLE = web3.utils.asciiToHex("0");
const INIT_ROLE = web3.utils.soliditySha3("INIT");

contract("ShitLord initialization", async (accounts) => {
  it("Deployer should not have init role", async () =>
    ShitLord.deployed()
      .then((instance) => instance.hasRole(INIT_ROLE, accounts[0]))
      .then((deployerHasInitRole) => {
        assert.isFalse(deployerHasInitRole, "Deployer still has init role.");
      }));
  it("Deployer should not have admin role", async () =>
    ShitLord.deployed()
      .then((instance) => instance.hasRole(DEFAULT_ADMIN_ROLE, accounts[0]))
      .then((deployerHasAdminRole) => {
        assert.isFalse(deployerHasAdminRole, "Deployer still has admin role");
      }));
  it("No one should have admin role", async () =>
    ShitLord.deployed()
      .then((instance) => instance.getRoleMemberCount(DEFAULT_ADMIN_ROLE))
      .then((adminCount) => {
        assert.equal(
          adminCount.valueOf(),
          0,
          "The number of admins was more than 1"
        );
      }));
  it("No one should have init role", async () =>
    ShitLord.deployed()
      .then((instance) => instance.getRoleMemberCount(INIT_ROLE))
      .then((initCount) => {
        assert.equal(
          initCount.valueOf(),
          0,
          "The number of init accounts was more than 1"
        );
      }));
});
