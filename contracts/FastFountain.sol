// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

import "./interfaces/IDogeShit.sol";
import "./DecimalMath.sol";

/** @title FastFountain
		@notice The contract that handles the staking rewards but 1M times faster.
		@dev This contract relies on some of the <code>uint256</code> being represented as PreciseDecimals
			and Decimals as per the DecimalMath contract. Decimals and PreciseDecimals are incompatible with each other,
			with the Decimal representation having 9 decimal places, and the PreciseDecimal representation having 24 decimal
			places.
*/
contract FastFountain is AccessControlEnumerable {

	using DecimalMath for uint256;

	IDogeShit public DogeShit;

	uint256 public genesis;
	uint256 public total_stake = 0; // int
	uint256 public last_reward_block = 0; // int
	uint256 public reward_per_token = 0; // PreciseDecimal

	mapping(address => uint256) public stake; // int
	mapping(address => uint256) public reward_tally; //int

	uint256[13] public rewards = [9696000000000, 6969000000000, 3693000000000, 1337000000000, 420000000000, 69000000000, 42000000000, 13000000000, 9000000000, 6000000000, 4000000000, 2000000000, 1000000000];
	uint256[13] public rewards_timeline = [30, 60, 90, 120, 150, 174, 348, 550, 750, 1000, 1250, 1500, 2000];
	uint256 public rewards_delay = 0;

	bytes32 public constant INIT = keccak256("INIT");

	/** @dev The sender will be granted with the INIT role. <code>init_shit</code> should be called immediately
				after the Dogeshit contract is deployed. Doing so will renounce this role.
	*/
	constructor() {
		_setupRole(INIT, msg.sender);
	}

	/** @param shit_address The address of the Dogeshit contract.
			@notice This function should only be called once by the deployer during deployment.
			@dev This function should be called immediately after the Dogeshit contract is deployed.
	*/
	function init_shit(address shit_address) public onlyRole(INIT) {
		DogeShit = IDogeShit(shit_address);
		genesis = block.number;
		renounceRole(INIT, msg.sender);
	}

	/** @param amount The amount of Dogeshit to stake. Note 1 dSHT = 1000000000
			@notice This function will stake the specified amount of Dogeshit.
	*/
	function deposit_stake(uint256 amount) public {
		stake[msg.sender] = stake[msg.sender] + amount;
		DogeShit.transferFrom(msg.sender, address(this), amount);
		total_stake = total_stake + amount;
		reward_tally[msg.sender] = reward_tally[msg.sender] + reward_per_token.multiplyDecimalRoundPrecise(amount.decimalToPreciseDecimal());
		distribute();
	}

	/** @notice This function will calculate the current reward per token. This doesn't send any token, it simply updates the values used
				to calculate what is required to be sent. This is called before any stake is deposited, withdrawn, or rewards are claimed.
				So while you can call this function if you choose to do so, you'll simply spend gas on an operation that should be handled when it is needed to be.
	*/
	function distribute() public {
		if (total_stake == 0) {
			reward_per_token = 0;
		}
		if ( last_reward_block < block.number) {
			/*
			uint256 rpb = reward_per_block();
		  uint256 blocks = block.number - last_reward_block;
		  uint256 rewards = blocks*rpb;
			uint256 preciseNewRewards = rewards.divideDecimalRoundPrecise(total_stake);
		  reward_per_token = reward_per_token + preciseNewRewards;
			*/
		 	uint256 outstanding_rewards = pending_rewards();
			reward_per_token = reward_per_token + outstanding_rewards.decimalToPreciseDecimal().divideDecimalRoundPrecise(total_stake.decimalToPreciseDecimal());
		}
		last_reward_block = block.number;
	}

	/** @param account The address of the account to see the currently unclaimed rewards.
			@return uint256  The amount of unclaimed rewards for the given account.
			@notice Get the amount of unclaimed rewards for the given account.
			@dev This view assumes that <code>distribute</code> has not been called, and should be used
					for displaying the unclaimed rewards publically. This avoids needlessly updating the state
					to simply see the outstanding rewards.
	*/
	function unclaimed_reward(address account) public view returns (uint256) {
	 uint256 outstanding_rewards = pending_rewards();
	 uint256 _reward_per_token = reward_per_token + outstanding_rewards.decimalToPreciseDecimal().divideDecimalRoundPrecise(total_stake.decimalToPreciseDecimal());
	 uint256 _total_rewards = stake[account].decimalToPreciseDecimal().multiplyDecimalRoundPrecise(_reward_per_token);
	 return (_total_rewards - reward_tally[account]).preciseDecimalToDecimal();
	}

	/** @param account The address of the account to compute the reward for.
			@return uint256  The amount of the reward for the given account.
			@dev This view is used internally and assumes that <code>distribute</code> has already been called.
	*/
	function compute_reward(address account) internal view returns (uint256) {
		return (stake[account].decimalToPreciseDecimal().multiplyDecimalRoundPrecise(reward_per_token) - reward_tally[account]).preciseDecimalToDecimal();
	}

	/** @notice This function will withdraw any rewards currently outstanding to the sender address */
	function withdraw_rewards() public {
		distribute();
		uint256 reward = compute_reward(msg.sender);
		if ( reward > 0 ) {
			reward_tally[msg.sender] = stake[msg.sender].decimalToPreciseDecimal().multiplyDecimalRoundPrecise(reward_per_token);
			DogeShit.mint(msg.sender, reward);
		}
	}

	/** @param amount The amount of Dogeshit stake to withdraw. Note 1 dSHT = 1000000000
			@notice This function will withdraw the specified amount of Dogeshit stake (and any unclaimed rewards) to the sender address.
	*/
	function withdraw_stake(uint256 amount) public {
		require(amount <= stake[msg.sender], "Amount requested is more than currently staked.");
		withdraw_rewards();
		stake[msg.sender] = stake[msg.sender] - amount;
		reward_tally[msg.sender] = reward_tally[msg.sender] - (reward_per_token.multiplyDecimalRoundPrecise(amount.decimalToPreciseDecimal()));
		total_stake = total_stake - amount;
		DogeShit.transfer(msg.sender, amount);
	}


	function pending_rewards() public view returns (uint256) {
		uint256 currentRate;
		uint256 currentBlocks;
		uint256 prevRate;
		uint256 prevBlocks;
		(currentRate, currentBlocks, prevRate, prevBlocks) = reward_information();
		return currentRate*currentBlocks + prevRate*prevBlocks;
	}

	function reward_information() private view returns (uint256, uint256, uint256, uint256) {
		uint256 blocksPrev;
		uint256 blocksCurrent;
		int256 blockNum = current_block();
		uint256 blockVal = uint(blockNum);
		if (blockNum < 0) {
			return (0, 0, 0, 0);
		}
		if (blockVal < rewards_timeline[0]) {
			return (rewards[0], blocks_since_last_reward(), 0, 0);
		}
		for (uint i=1; i < rewards_timeline.length; i++) {
			if (blockVal < rewards_timeline[i]) {
				(blocksCurrent, blocksPrev) = blocks_award_split(rewards_timeline[i-1]);
				return (rewards[i], blocksCurrent, rewards[i-1], blocksPrev);
			}
		}
		(blocksCurrent, blocksPrev) = blocks_award_split(rewards_timeline[rewards_timeline.length - 2]);
		return (rewards[rewards_timeline.length - 1], blocksCurrent, rewards[rewards_timeline.length - 2], blocksPrev);
	}

	function blocks_award_split(uint256 last_cutoff) public view returns (uint256, uint256) {
		int256 blockNum = current_block();
		uint256 blockVal = uint(blockNum);
		if (blockNum < 0) {
			return (0, 0);
		}
		uint256 blocksSince = blocks_since_last_reward();
		uint256 blocksAfterCutoff = blockVal - last_cutoff;
		if (blocksAfterCutoff < blocksSince) {
			return (blocksAfterCutoff, blocksSince - blocksAfterCutoff);
		}
		return (blocksSince, 0);
	}

	function blocks_since_last_reward() private view returns (uint256) {
		if (last_reward_block == 0) {
			return 0;
		}
		return block.number - last_reward_block;
	}

	function current_block() public view returns (int256) {
		return int256(block.number - (genesis + rewards_delay));
	}

	/** @notice The total amount of rewards that will be distributed to the pool with each block.
			@return uint256  The current total number of rewards per block.
	*/
	function current_reward_per_block() public view returns (uint) {
		int256 blockNum = current_block();
		uint256 blockVal = uint(blockNum);
		if (blockNum < 0) {
			return 0;
		}
		for (uint i=0; i < rewards_timeline.length; i++) {
			if (blockVal < rewards_timeline[i]) {
				return rewards[i];
			}
		}
		return rewards[rewards_timeline.length - 1];
	}
}
