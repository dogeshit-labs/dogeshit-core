const FastFountain = artifacts.require("FastFountain");
const FastShit = artifacts.require("FastShit");
const FakeDoge = artifacts.require("FakeDoge");
const OtherDoge = artifacts.require("OtherDoge");
const FastLord = artifacts.require("FastLord");

const { mineBlocks } = require("../utils/testHelpers");

const rewardPerBlock = (stake, total, rewards) =>
  (stake / total) * rewards * 10 ** 9;

contract("FastFountain Interaction", async (accounts) => {
  before(async () => {
    let fastLord = await FastLord.deployed();
    let fakeDoge = await FakeDoge.deployed();
    let otherDoge = await OtherDoge.deployed();
    let fastShit = await FastShit.deployed();

    let fakeDogeSupply = await fakeDoge.totalSupply();
    await fakeDoge.approve(fastLord.address, fakeDogeSupply.toNumber(), {
      from: accounts[0],
    });
    await fastLord.make_shit(fakeDoge.address, fakeDogeSupply.toNumber(), {
      from: accounts[0],
    });

    let otherDogeSupply = await otherDoge.totalSupply();
    await otherDoge.transfer(accounts[1], otherDogeSupply.toNumber(), {
      from: accounts[0],
    });
    await otherDoge.approve(fastLord.address, otherDogeSupply.toNumber(), {
      from: accounts[1],
    });
    await fastLord.make_shit(otherDoge.address, otherDogeSupply.toNumber(), {
      from: accounts[1],
    });

    let fastFountain = await FastFountain.deployed();
    await fastShit.approve(
      fastFountain.address,
      fakeDogeSupply.toNumber() * 10,
      { from: accounts[0] }
    );
    await fastFountain.deposit_stake(fakeDogeSupply.toNumber() * 10, {
      from: accounts[0],
    });
  });
  it("Should claim the correct amount of rewards after waiting 30 blocks", async () => {
    let fastShit = await FastShit.deployed();
    let initFastShitBalance = await fastShit.balanceOf(accounts[0]);
    let fastFountain = await FastFountain.deployed();
    // 1 in deploy ??
    // 6 in before
    // 1 with stake
    let expectedRewards = (9696 * 22 + 6969 * 9) * 10 ** 9;

    await mineBlocks(accounts[0], 30);
    await fastFountain.withdraw_rewards({ from: accounts[0] });

    let postFastShitBalance = await fastShit.balanceOf(accounts[0]);

    assert.equal(
      postFastShitBalance.toNumber() - initFastShitBalance.toNumber(),
      expectedRewards,
      "Wrong number of rewards claimed after 30 blocks"
    );
  });
  it("accounts[1] should stake and claim the correct amount of rewards after another 30", async () => {
    let fastShit = await FastShit.deployed();
    let fastFountain = await FastFountain.deployed();
    let initFastShitBalance = await fastShit.balanceOf(accounts[1]);
    await fastShit.approve(
      fastFountain.address,
      initFastShitBalance.toNumber(),
      { from: accounts[1] }
    );
    await fastFountain.deposit_stake(initFastShitBalance.toNumber(), {
      from: accounts[1],
    });
    let expectedRewards = Math.round(
      (6900 / (6900 + 420)) * (6969 * 19 + 3693 * 12) * 10 ** 9
    );
    await mineBlocks(accounts[0], 30);
    await fastFountain.withdraw_rewards({ from: accounts[1] });
    let postFastShitBalance = await fastShit.balanceOf(accounts[1]);

    assert.equal(
      postFastShitBalance.toNumber(),
      expectedRewards,
      "Wrong number of rewards claimed after 30 blocks."
    );
  });
});
