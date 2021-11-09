const FastFountain = artifacts.require("FastFountain");
const FastShit = artifacts.require("FastShit");
const FakeDoge = artifacts.require("FakeDoge");
const FastLord = artifacts.require("FastLord");

const { mineBlocks } = require("../utils/testHelpers");

const rewardPerBlock = (stake, total, rewards) =>
  (stake / total) * rewards * 10 ** 9;

contract("FastFountain Interaction", async (accounts) => {
  before(async () => {
    let fastLord = await FastLord.deployed();
    let fakeDoge = await FakeDoge.deployed();
    let fastShit = await FastShit.deployed();

    let fakeDogeSupply = await fakeDoge.totalSupply();
    await fakeDoge.approve(fastLord.address, fakeDogeSupply.toNumber());
    await fastLord.make_shit(fakeDoge.address, fakeDogeSupply.toNumber());

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
    // 3 in before
    // 1 with stake
    let expectedRewards = (9696 * 25 + 6969 * 6) * 10 ** 9;

    await mineBlocks(accounts[0], 30);
    await fastFountain.withdraw_rewards({ from: accounts[0] });

    let postFastShitBalance = await fastShit.balanceOf(accounts[0]);

    assert.equal(
      postFastShitBalance.toNumber() - initFastShitBalance.toNumber(),
      expectedRewards,
      "Wrong number of rewards claimed after 30 blocks"
    );
  });
});
