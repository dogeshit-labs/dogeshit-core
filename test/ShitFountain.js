const ShitFountain = artifacts.require("ShitFountain");
const DogeShit = artifacts.require("DogeShit");
const FakeDoge = artifacts.require("FakeDoge");
const OtherDoge = artifacts.require("OtherDoge");
const ShitLord = artifacts.require("ShitLord");

const { mineBlocks, rewardPerBlock } = require("../utils/testHelpers");

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
          Math.round(reward_per_block.valueOf()),
          9696 * 10 ** 9,
          "The initial reward per block was not 9696 dSHT"
        );
      }));
});

contract("ShitFountain Interaction", async (accounts) => {
  before(async () => {
    let shitLord = await ShitLord.deployed();
    let fakeDoge = await FakeDoge.deployed();
    let otherDoge = await OtherDoge.deployed();
    let dogeShit = await DogeShit.deployed();
    let fakeDogeSupply = await fakeDoge.totalSupply();
    let otherDogeSupply = await otherDoge.totalSupply();

    let sendAmounts = [1830, 915, 610, 244, 60, 0.5, 0.25, 0.2, 0.05];

    await fakeDoge.approve(shitLord.address, fakeDogeSupply.toNumber());
    await otherDoge.approve(shitLord.address, otherDogeSupply.toNumber());

    await shitLord.make_shit(fakeDoge.address, fakeDogeSupply.toNumber(), {
      from: accounts[0],
    });
    await shitLord.make_shit(otherDoge.address, otherDogeSupply.toNumber(), {
      from: accounts[0],
    });

    const sendingLoop = async (_) => {
      sendAmounts.forEach(async (amount, i) => {
        await dogeShit.transfer(accounts[i + 1], amount * 10 ** 9);
      });
    };
    await sendingLoop();
  });

  it("accounts[0] should successfully stake 1800 dSHT", async () => {
    let shitFountain = await ShitFountain.deployed();
    let dogeShit = await DogeShit.deployed();

    let amountToStake = 1800 * 10 ** 9;

    let initDogeShitBalance = await dogeShit.balanceOf(accounts[0]);
    await dogeShit.approve(shitFountain.address, amountToStake, {
      from: accounts[0],
    });
    await shitFountain.deposit_stake(amountToStake, { from: accounts[0] });

    let currentStaked = await shitFountain.stake(accounts[0]);
    let totalStaked = await shitFountain.total_stake.call();
    let postDogeShitBalance = await dogeShit.balanceOf(accounts[0]);

    assert.equal(
      currentStaked.toNumber(),
      amountToStake,
      "The correct amount was not staked."
    );

    assert.equal(
      initDogeShitBalance.toNumber() - amountToStake,
      postDogeShitBalance,
      "The staked dogeshit was not sent."
    );

    await mineBlocks(accounts[0], 2);

    let unclaimedReward = await shitFountain.unclaimed_reward(accounts[0]);

    assert.equal(
      unclaimedReward.toNumber(),
      Math.round(2 * rewardPerBlock(amountToStake, totalStaked.toNumber())),
      "accounts[0] has the incorrect unclaimed reward after 2 blocks."
    );
  });

  it("accounts[1] should successfully stake 1800 dSHT", async () => {
    let shitFountain = await ShitFountain.deployed();
    let dogeShit = await DogeShit.deployed();

    let amountToStake = 1800 * 10 ** 9;

    let initDogeShitBalance = await dogeShit.balanceOf(accounts[1]);
    await dogeShit.approve(shitFountain.address, amountToStake, {
      from: accounts[1],
    });
    await shitFountain.deposit_stake(amountToStake, { from: accounts[1] });

    let currentStaked = await shitFountain.stake(accounts[1]);
    let totalStaked = await shitFountain.total_stake.call();
    let postDogeShitBalance = await dogeShit.balanceOf(accounts[1]);

    assert.equal(
      currentStaked.toNumber(),
      amountToStake,
      "The correct amount was not staked."
    );

    assert.equal(
      initDogeShitBalance.toNumber() - amountToStake,
      postDogeShitBalance,
      "The staked dogeshit was not sent."
    );

    await mineBlocks(accounts[0], 2);

    let unclaimedReward = await shitFountain.unclaimed_reward(accounts[1]);

    assert.equal(
      unclaimedReward.toNumber(),
      Math.round(2 * rewardPerBlock(amountToStake, totalStaked.toNumber())),
      "accounts[1] has the incorrect unclaimed rewards after blocks."
    );
  });

  it("accounts[2] should successfully stake 115 dSHT", async () => {
    let shitFountain = await ShitFountain.deployed();
    let dogeShit = await DogeShit.deployed();

    let amountToStake = 115 * 10 ** 9;

    let initDogeShitBalance = await dogeShit.balanceOf(accounts[2]);
    await dogeShit.approve(shitFountain.address, amountToStake, {
      from: accounts[2],
    });
    await shitFountain.deposit_stake(amountToStake, { from: accounts[2] });

    let currentStaked = await shitFountain.stake(accounts[2]);
    let totalStaked = await shitFountain.total_stake.call();
    let postDogeShitBalance = await dogeShit.balanceOf(accounts[2]);

    assert.equal(
      currentStaked.toNumber(),
      amountToStake,
      "The correct amount was not staked."
    );

    assert.equal(
      initDogeShitBalance.toNumber() - amountToStake,
      postDogeShitBalance,
      "The staked dogeshit was not sent."
    );

    await mineBlocks(accounts[0], 2);

    let unclaimedReward = await shitFountain.unclaimed_reward(accounts[2]);

    assert.equal(
      unclaimedReward.toNumber(),
      Math.round(2 * rewardPerBlock(amountToStake, totalStaked.toNumber())),
      "accounts[2] has the incorrect unclaimed rewards after blocks."
    );
  });

  it("accounts[3] should successfully stake 610 dSHT", async () => {
    let shitFountain = await ShitFountain.deployed();
    let dogeShit = await DogeShit.deployed();

    let amountToStake = 610 * 10 ** 9;

    let initDogeShitBalance = await dogeShit.balanceOf(accounts[3]);
    await dogeShit.approve(shitFountain.address, amountToStake, {
      from: accounts[3],
    });
    await shitFountain.deposit_stake(amountToStake, { from: accounts[3] });

    let currentStaked = await shitFountain.stake(accounts[3]);
    let totalStaked = await shitFountain.total_stake.call();
    let postDogeShitBalance = await dogeShit.balanceOf(accounts[3]);

    assert.equal(
      currentStaked.toNumber(),
      amountToStake,
      "The correct amount was not staked."
    );

    assert.equal(
      initDogeShitBalance.toNumber() - amountToStake,
      postDogeShitBalance,
      "The staked dogeshit was not sent."
    );

    await mineBlocks(accounts[0], 2);

    let unclaimedReward = await shitFountain.unclaimed_reward(accounts[3]);

    assert.equal(
      unclaimedReward.toNumber(),
      Math.round(2 * rewardPerBlock(amountToStake, totalStaked.toNumber())),
      "accounts[3] has the incorrect unclaimed rewards after blocks."
    );
  });

  it("accounts[4] should successfully stake 225 dSHT", async () => {
    let shitFountain = await ShitFountain.deployed();
    let dogeShit = await DogeShit.deployed();

    let amountToStake = 225 * 10 ** 9;

    let initDogeShitBalance = await dogeShit.balanceOf(accounts[4]);
    await dogeShit.approve(shitFountain.address, amountToStake, {
      from: accounts[4],
    });
    await shitFountain.deposit_stake(amountToStake, { from: accounts[4] });

    let currentStaked = await shitFountain.stake(accounts[4]);
    let totalStaked = await shitFountain.total_stake();
    let postDogeShitBalance = await dogeShit.balanceOf(accounts[4]);

    assert.equal(
      currentStaked.toNumber(),
      amountToStake,
      "The correct amount was not staked."
    );

    assert.equal(
      initDogeShitBalance.toNumber() - amountToStake,
      postDogeShitBalance,
      "The staked dogeshit was not sent."
    );

    await mineBlocks(accounts[0], 2);

    let unclaimedReward = await shitFountain.unclaimed_reward(accounts[4]);

    assert.equal(
      unclaimedReward.toNumber(),
      Math.round(2 * rewardPerBlock(amountToStake, totalStaked.toNumber())),
      "accounts[4] has the incorrect unclaimed rewards after blocks."
    );
  });

  it("accounts[5] should successfully stake 60 dSHT", async () => {
    let shitFountain = await ShitFountain.deployed();
    let dogeShit = await DogeShit.deployed();

    let amountToStake = 60 * 10 ** 9;

    let initDogeShitBalance = await dogeShit.balanceOf(accounts[5]);
    await dogeShit.approve(shitFountain.address, amountToStake, {
      from: accounts[5],
    });
    await shitFountain.deposit_stake(amountToStake, { from: accounts[5] });

    let currentStaked = await shitFountain.stake(accounts[5]);
    let totalStaked = await shitFountain.total_stake();
    let postDogeShitBalance = await dogeShit.balanceOf(accounts[5]);

    assert.equal(
      currentStaked.toNumber(),
      amountToStake,
      "The correct amount was not staked."
    );

    assert.equal(
      initDogeShitBalance.toNumber() - amountToStake,
      postDogeShitBalance,
      "The staked dogeshit was not sent."
    );

    await mineBlocks(accounts[0], 2);

    let unclaimedReward = await shitFountain.unclaimed_reward(accounts[5]);

    assert.equal(
      unclaimedReward.toNumber(),
      Math.round(2 * rewardPerBlock(amountToStake, totalStaked.toNumber())),
      "accounts[5] has the incorrect unclaimed rewards after blocks."
    );
  });

  it("accounts[6] should successfully stake 0.5 dSHT", async () => {
    let shitFountain = await ShitFountain.deployed();
    let dogeShit = await DogeShit.deployed();

    let amountToStake = 5 * 10 ** 8;

    let initDogeShitBalance = await dogeShit.balanceOf(accounts[6]);
    await dogeShit.approve(shitFountain.address, amountToStake, {
      from: accounts[6],
    });
    await shitFountain.deposit_stake(amountToStake, { from: accounts[6] });

    let currentStaked = await shitFountain.stake(accounts[6]);
    let totalStaked = await shitFountain.total_stake();
    let postDogeShitBalance = await dogeShit.balanceOf(accounts[6]);

    assert.equal(
      currentStaked.toNumber(),
      amountToStake,
      "The correct amount was not staked."
    );

    assert.equal(
      initDogeShitBalance.toNumber() - amountToStake,
      postDogeShitBalance,
      "The staked dogeshit was not sent."
    );

    await mineBlocks(accounts[0], 2);

    let unclaimedReward = await shitFountain.unclaimed_reward(accounts[6]);

    assert.equal(
      unclaimedReward.toNumber(),
      Math.round(2 * rewardPerBlock(amountToStake, totalStaked.toNumber())),
      "accounts[6] has the incorrect unclaimed rewards after blocks."
    );
  });

  it("accounts[7] should successfully stake 0.2 dSHT", async () => {
    let shitFountain = await ShitFountain.deployed();
    let dogeShit = await DogeShit.deployed();

    let amountToStake = 2 * 10 ** 8;

    let initDogeShitBalance = await dogeShit.balanceOf(accounts[7]);
    await dogeShit.approve(shitFountain.address, amountToStake, {
      from: accounts[7],
    });
    await shitFountain.deposit_stake(amountToStake, { from: accounts[7] });

    let currentStaked = await shitFountain.stake(accounts[7]);
    let totalStaked = await shitFountain.total_stake();
    let postDogeShitBalance = await dogeShit.balanceOf(accounts[7]);

    assert.equal(
      currentStaked.toNumber(),
      amountToStake,
      "The correct amount was not staked."
    );

    assert.equal(
      initDogeShitBalance.toNumber() - amountToStake,
      postDogeShitBalance,
      "The staked dogeshit was not sent."
    );

    await mineBlocks(accounts[0], 2);

    let unclaimedReward = await shitFountain.unclaimed_reward(accounts[7]);

    assert.equal(
      unclaimedReward.toNumber(),
      Math.round(2 * rewardPerBlock(amountToStake, totalStaked.toNumber())),
      "accounts[7] has the incorrect unclaimed rewards after blocks."
    );
  });

  it("accounts[8] should successfully stake 0.2 dSHT", async () => {
    let shitFountain = await ShitFountain.deployed();
    let dogeShit = await DogeShit.deployed();

    let amountToStake = 2 * 10 ** 8;

    let initDogeShitBalance = await dogeShit.balanceOf(accounts[8]);
    await dogeShit.approve(shitFountain.address, amountToStake, {
      from: accounts[8],
    });
    await shitFountain.deposit_stake(amountToStake, { from: accounts[8] });

    let currentStaked = await shitFountain.stake(accounts[8]);
    let totalStaked = await shitFountain.total_stake();
    let postDogeShitBalance = await dogeShit.balanceOf(accounts[8]);

    assert.equal(
      currentStaked.toNumber(),
      amountToStake,
      "The correct amount was not staked."
    );

    assert.equal(
      initDogeShitBalance.toNumber() - amountToStake,
      postDogeShitBalance,
      "The staked dogeshit was not sent."
    );

    await mineBlocks(accounts[0], 2);

    let unclaimedReward = await shitFountain.unclaimed_reward(accounts[8]);

    assert.equal(
      unclaimedReward.toNumber(),
      Math.round(2 * rewardPerBlock(amountToStake, totalStaked.toNumber())),
      "accounts[8] has the incorrect unclaimed rewards after blocks."
    );
  });

  it("accounts[9] should successfully stake 0.02 dSHT", async () => {
    let shitFountain = await ShitFountain.deployed();
    let dogeShit = await DogeShit.deployed();

    let amountToStake = 2 * 10 ** 7;

    let initDogeShitBalance = await dogeShit.balanceOf(accounts[9]);
    await dogeShit.approve(shitFountain.address, amountToStake, {
      from: accounts[9],
    });
    await shitFountain.deposit_stake(amountToStake, { from: accounts[9] });

    let currentStaked = await shitFountain.stake(accounts[9]);
    let totalStaked = await shitFountain.total_stake();
    let postDogeShitBalance = await dogeShit.balanceOf(accounts[9]);

    assert.equal(
      currentStaked.toNumber(),
      amountToStake,
      "The correct amount was not staked."
    );

    assert.equal(
      initDogeShitBalance.toNumber() - amountToStake,
      postDogeShitBalance,
      "The staked dogeshit was not sent."
    );

    await mineBlocks(accounts[0], 2);

    let unclaimedReward = await shitFountain.unclaimed_reward(accounts[9]);

    assert.equal(
      unclaimedReward.toNumber(),
      Math.round(2 * rewardPerBlock(amountToStake, totalStaked.toNumber())),
      "accounts[9] has the incorrect unclaimed rewards after blocks."
    );
  });

  it("accounts[0] should claim the correct amount of awards", async () => {
    let shitFountain = await ShitFountain.deployed();
    let dogeShit = await DogeShit.deployed();
    let initDogeShitBalance = await dogeShit.balanceOf(accounts[0]);

    let expectedRewards = Math.round(
      4 * rewardPerBlock(1800, 1800) +
        4 * rewardPerBlock(1800, 3600) +
        4 * rewardPerBlock(1800, 3715) +
        4 * rewardPerBlock(1800, 4325) +
        4 * rewardPerBlock(1800, 4550) +
        4 * rewardPerBlock(1800, 4610) +
        4 * rewardPerBlock(18000, 46105) +
        4 * rewardPerBlock(18000, 46107) +
        4 * rewardPerBlock(18000, 46109) +
        3 * rewardPerBlock(180000, 461092)
    );

    await shitFountain.withdraw_rewards({ from: accounts[0] });

    let postDogeShitBalance = await dogeShit.balanceOf(accounts[0]);

    assert.equal(
      postDogeShitBalance.valueOf() - initDogeShitBalance.valueOf(),
      expectedRewards,
      "accounts[0] did not claim the correct amount of Dogeshit"
    );
  });

  it("accounts[0] should immediately again claim the right amount of awards", async () => {
    let shitFountain = await ShitFountain.deployed();
    let dogeShit = await DogeShit.deployed();
    let initDogeShitBalance = await dogeShit.balanceOf(accounts[0]);

    let expectedRewards = Math.round(rewardPerBlock(180000, 461092));

    await shitFountain.withdraw_rewards({ from: accounts[0] });

    let postDogeShitBalance = await dogeShit.balanceOf(accounts[0]);

    assert.equal(
      postDogeShitBalance.valueOf() - initDogeShitBalance.valueOf(),
      expectedRewards,
      "accounts[0] did not claim the correct amount of Dogeshit"
    );
  });

  it("accounts[0] should withdraw the correct amount of dSHT", async () => {
    let shitFountain = await ShitFountain.deployed();
    let dogeShit = await DogeShit.deployed();
    let initDogeShitBalance = await dogeShit.balanceOf(accounts[0]);

    let expectedWithdraw = Math.round(
      1800 * 10 ** 9 + rewardPerBlock(180000, 461092)
    );

    await shitFountain.withdraw_stake(1800 * 10 ** 9, { from: accounts[0] });

    let postDogeShitBalance = await dogeShit.balanceOf(accounts[0]);

    assert.equal(
      postDogeShitBalance.valueOf() - initDogeShitBalance.valueOf(),
      expectedWithdraw,
      "accounts[0] did not claim the correct amount of Dogeshit"
    );
  });

  it("accounts[1] should claim and restake the correct amount of rewards", async () => {
    let shitFountain = await ShitFountain.deployed();
    let dogeShit = await DogeShit.deployed();
    let initDogeShitBalance = await dogeShit.balanceOf(accounts[1]);

    let expectedRewards = Math.round(
      4 * rewardPerBlock(1800, 3600) +
        4 * rewardPerBlock(1800, 3715) +
        4 * rewardPerBlock(1800, 4325) +
        4 * rewardPerBlock(1800, 4550) +
        4 * rewardPerBlock(1800, 4610) +
        4 * rewardPerBlock(18000, 46105) +
        4 * rewardPerBlock(18000, 46107) +
        4 * rewardPerBlock(18000, 46109) +
        5 * rewardPerBlock(180000, 461092) +
        4 * rewardPerBlock(180000, 281092)
    ); // 176807099634463;

    await mineBlocks(accounts[0], 3);
    await shitFountain.withdraw_rewards({ from: accounts[1] });
    let postDogeShitBalance = await dogeShit.balanceOf(accounts[1]);
    await dogeShit.approve(shitFountain.address, expectedRewards, {
      from: accounts[1],
    });
    await shitFountain.deposit_stake(expectedRewards, { from: accounts[1] });
    assert.equal(
      postDogeShitBalance.valueOf() - initDogeShitBalance.valueOf(),
      expectedRewards,
      "accounts[1] did not claim the correct amount of Dogeshit"
    );
  });

  it("accounts[2] should withdraw the correct amount", async () => {
    let shitFountain = await ShitFountain.deployed();
    let dogeShit = await DogeShit.deployed();
    let initDogeShitBalance = await dogeShit.balanceOf(accounts[2]);

    let expectedRewards = Math.round(
      4 * rewardPerBlock(115, 3715) +
        4 * rewardPerBlock(115, 4325) +
        4 * rewardPerBlock(115, 4550) +
        4 * rewardPerBlock(115, 4610) +
        4 * rewardPerBlock(1150, 46105) +
        4 * rewardPerBlock(1150, 46107) +
        4 * rewardPerBlock(1150, 46109) +
        5 * rewardPerBlock(11500, 461092) +
        6 * rewardPerBlock(11500, 281092) +
        4 * 6306534083.2199135
    );

    await mineBlocks(accounts[0], 3);
    await shitFountain.withdraw_stake(115 * 10 ** 9, { from: accounts[2] });
    let postDogeShitBalance = await dogeShit.balanceOf(accounts[2]);

    assert.equal(
      postDogeShitBalance.valueOf() - initDogeShitBalance.valueOf(),
      115 * 10 ** 9 + expectedRewards,
      "accounts[2] did not claim the correct amount of Dogeshit"
    );
  });
});
