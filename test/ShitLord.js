const ShitLord = artifacts.require("ShitLord");
const DogeShit = artifacts.require("DogeShit");
const FakeDoge = artifacts.require("FakeDoge");
const OtherDoge = artifacts.require("OtherDoge");

const { expectRevert } = require("@openzeppelin/test-helpers");

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
  it("First supported doge should be 'FakeDoge'", async () => {
    let fakeDogeAddress;

    FakeDoge.deployed().then((instance) => {
      fakeDogeAddress = instance.address;
    });

    return ShitLord.deployed()
      .then((instance) => instance.doge_contracts(0))
      .then((doge0) => {
        assert.equal(
          doge0,
          fakeDogeAddress,
          "The first supported doge address was not the address of FakeDoge"
        );
      });
  });
  it("Second supported doge should be 'OtherDoge'", async () => {
    let otherDogeAddress;

    OtherDoge.deployed().then((instance) => {
      otherDogeAddress = instance.address;
    });

    return ShitLord.deployed()
      .then((instance) => instance.doge_contracts(1))
      .then((doge1) => {
        assert.equal(
          doge1,
          otherDogeAddress,
          "The second supported doge address was not the address of OtherDoge"
        );
      });
  });
  it("Third supported doge should be revert", async () => {
    ShitLord.deployed().then((instance) => {
      expectRevert(
        instance.doge_contracts(2),
        "Uncaught Error: Returned error: VM Exception while processing transaction: revert"
      );
    });
  });
});
