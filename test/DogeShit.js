const Dogeshit = artifacts.require("DogeShit");
const ShitLord = artifacts.require("ShitLord");
const ShitFountain = artifacts.require("ShitFountain");

const { makeRoleRevertMessage } = require("../utils/testHelpers.js");
const { expectRevert } = require("@openzeppelin/test-helpers");

const DEFAULT_ADMIN_ROLE = web3.utils.asciiToHex("0");
const MINTING_ROLE = web3.utils.soliditySha3("SHIT_MAKER_ROLE");

contract("Dogeshit intialization", async (accounts) => {
  it("Should have no supply", async () =>
    Dogeshit.deployed()
      .then((instance) => instance.totalSupply())
      .then((supply) => {
        assert.equal(supply.valueOf(), 0, "Dogeshit had an initial supply");
      }));
  it("Should have 9 decimals", async () =>
    Dogeshit.deployed()
      .then((instance) => instance.decimals())
      .then((decimals) => {
        assert.equal(
          decimals.valueOf(),
          9,
          "Dogeshit does not have 9 decimals"
        );
      }));
  it("Deployer should not have admin role", async () =>
    Dogeshit.deployed()
      .then((instance) => instance.hasRole(DEFAULT_ADMIN_ROLE, accounts[0]))
      .then((deployerHasAdminRole) => {
        assert.isFalse(deployerHasAdminRole, "Deployer still has admin role");
      }));
  it("Deployer should not have minting role", async () =>
    Dogeshit.deployed()
      .then((instance) => instance.hasRole(MINTING_ROLE, accounts[0]))
      .then((deployerHasMintingRole) => {
        assert.isFalse(
          deployerHasMintingRole,
          "Deployer somehow has minting role"
        );
      }));
  it("Deployer should have a balance of 0 Dogeshit", async () =>
    Dogeshit.deployed()
      .then((instance) => instance.balanceOf(accounts[0]))
      .then((deployerBalance) => {
        assert.equal(
          deployerBalance.valueOf(),
          0,
          "Deployed doesn't have 0 balance"
        );
      }));
  it("No one should have admin role", async () =>
    Dogeshit.deployed()
      .then((instance) => instance.getRoleMemberCount(DEFAULT_ADMIN_ROLE))
      .then((adminCount) => {
        assert.equal(
          adminCount.valueOf(),
          0,
          "The number of admins was more than 1"
        );
      }));
  it("Only 2 addresses should have minting role", async () =>
    Dogeshit.deployed()
      .then((instance) => instance.getRoleMemberCount(MINTING_ROLE))
      .then((mintingRoleCount) => {
        assert.equal(
          mintingRoleCount.valueOf(),
          2,
          "The number of minting roles was not 2"
        );
      }));
  it("The ShitLord contract should have the miniting role", async () => {
    let shitLordAddress;

    await ShitLord.deployed().then((instance) => {
      shitLordAddress = instance.address;
    });

    return Dogeshit.deployed()
      .then((instance) => instance.hasRole(MINTING_ROLE, shitLordAddress))
      .then((shitLordHasMinting) => {
        assert.isTrue(
          shitLordHasMinting,
          "The ShitLord contract does not have the minting role"
        );
      });
  });
  it("The ShitFountain contract should have the miniting role", async () => {
    let shitFountainAddress;

    await ShitFountain.deployed().then((instance) => {
      shitFountainAddress = instance.address;
    });

    return Dogeshit.deployed()
      .then((instance) => instance.hasRole(MINTING_ROLE, shitFountainAddress))
      .then((shitFountainHasMinting) => {
        assert.isTrue(
          shitFountainHasMinting,
          "The ShitFountain contract does not have the minting role"
        );
      });
  });
  it("Deployer minting attempt fails", async () => {
    let dogeShit = await Dogeshit.deployed();
    let dogeShitInitSupply = await dogeShit.totalSupply();

    await expectRevert(
      dogeShit.mint(accounts[0], 696969 * 10 ** 9),
      makeRoleRevertMessage(accounts[0], MINTING_ROLE)
    );

    let dogeShitPostSupply = await dogeShit.totalSupply();

    assert.equal(
      dogeShitInitSupply.toNumber(),
      dogeShitPostSupply.toNumber(),
      "Dogeshit was minted anyways."
    );
  });
});
