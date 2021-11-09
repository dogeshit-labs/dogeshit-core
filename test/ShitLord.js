const ShitLord = artifacts.require("ShitLord");
const DogeShit = artifacts.require("DogeShit");
const FakeDoge = artifacts.require("FakeDoge");
const OtherDoge = artifacts.require("OtherDoge");
const NotDoge = artifacts.require("NotDoge");

const { expectRevert } = require("@openzeppelin/test-helpers");

const DEFAULT_ADMIN_ROLE = web3.utils.asciiToHex("0");
const INIT_ROLE = web3.utils.soliditySha3("INIT");

contract("ShitLord", async (accounts) => {
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
  it("Should only have 2 supported doges", async () => {
    let shitLord = await ShitLord.deployed();
    let dogeCount = await shitLord.doge_contracts_count();

    assert.equal(dogeCount.valueOf(), 2, "There wasn't 2 supported Doges");
  });
  it("FakeDoge should convert 1.00000000 <-> 1.000000000", async () => {
    let amountToConvert = 69 * 10 ** 8;

    let fakeDoge = await FakeDoge.deployed();
    let fakeDogeAddress = fakeDoge.address;
    let initFakeDogeBalance = await fakeDoge.balanceOf(accounts[0]);

    let dogeShit = await DogeShit.deployed();
    let initDogeShitBalance = await dogeShit.balanceOf(accounts[0]);

    let shitLord = await ShitLord.deployed();
    let shitLordAddress = shitLord.address;

    await fakeDoge.approve(shitLordAddress, amountToConvert);
    await shitLord.make_shit(fakeDogeAddress, amountToConvert, {
      from: accounts[0],
    });

    let postFakeDogeBalance = await fakeDoge.balanceOf(accounts[0]);
    let postDogeShitBalance = await dogeShit.balanceOf(accounts[0]);

    assert.equal(
      initFakeDogeBalance - amountToConvert,
      postFakeDogeBalance,
      "FakeDoge wasn't properly taken from the account."
    );

    assert.equal(
      initDogeShitBalance.toNumber() + amountToConvert * 10,
      postDogeShitBalance,
      "DogeShit wasn't properly given to the sender."
    );
  });
  it("OtherDoge should convert 1.00000000 <-> 1.000000000", async () => {
    let amountToConvert = 690 * 10 ** 8;

    let otherDoge = await OtherDoge.deployed();
    let otherDogeAddress = otherDoge.address;
    let initOtherDogeBalance = await otherDoge.balanceOf(accounts[0]);

    let dogeShit = await DogeShit.deployed();
    let initDogeShitBalance = await dogeShit.balanceOf(accounts[0]);

    let shitLord = await ShitLord.deployed();
    let shitLordAddress = shitLord.address;

    await otherDoge.approve(shitLordAddress, amountToConvert);
    await shitLord.make_shit(otherDogeAddress, amountToConvert, {
      from: accounts[0],
    });

    let postOtherDogeBalance = await otherDoge.balanceOf(accounts[0]);
    let postDogeShitBalance = await dogeShit.balanceOf(accounts[0]);

    assert.equal(
      initOtherDogeBalance - amountToConvert,
      postOtherDogeBalance,
      "OtherDoge wasn't properly taken from the account."
    );

    assert.equal(
      initDogeShitBalance.toNumber() + amountToConvert * 10,
      postDogeShitBalance,
      "DogeShit wasn't properly given to the sender."
    );
  });
  it("NotDoge should not convert", async () => {
    let amountToConvert = 69 * 10 ** 8;

    let notDoge = await NotDoge.deployed();
    let notDogeAddress = notDoge.address;
    let initNotDogeBalance = await notDoge.balanceOf(accounts[0]);

    let dogeShit = await DogeShit.deployed();
    let initDogeShitBalance = await dogeShit.balanceOf(accounts[0]);

    let shitLord = await ShitLord.deployed();
    let shitLordAddress = shitLord.address;

    await notDoge.approve(shitLordAddress, amountToConvert);
    await expectRevert(
      shitLord.make_shit(notDogeAddress, amountToConvert, {
        from: accounts[0],
      }),
      "The desired doge contract is not able to be made into shit."
    );

    let postNotDogeBalance = await notDoge.balanceOf(accounts[0]);
    let postDogeShitBalance = await dogeShit.balanceOf(accounts[0]);

    assert.equal(
      initNotDogeBalance.toNumber(),
      postNotDogeBalance.toNumber(),
      "NotDoge was improperly taken from the account."
    );

    assert.equal(
      initDogeShitBalance.toNumber(),
      postDogeShitBalance.toNumber(),
      "DogeShit was improperly given to the sender."
    );
  });
});
