// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

import "./interfaces/IDogeShit.sol";
import "./DecimalMath.sol";

/** @title ShitFountain
		@notice The contract that handles the staking rewards.
		@dev This contract relies on some of the <code>uint256</code> being represented as PreciseDecimals
			and Decimals as per the DecimalMath contract. Decimals and PreciseDecimals are incompatible with each other,
			with the Decimal representation having 9 decimal places, and the PreciseDecimal representation having 24 decimal
			places.
*/
contract ShitFountain is AccessControlEnumerable {

	using DecimalMath for uint256;

	IDogeShit public DogeShit;

	uint256 public genesis;
	uint256 public total_stake = 0; // int
	uint256 public last_reward_block = 0; // int
	uint256 public reward_per_token = 0; // PreciseDecimal

	mapping(address => uint256) public stake; // int
	mapping(address => uint256) public reward_tally; //int

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
		last_reward_block = block.number;
		renounceRole(INIT, msg.sender);
	}

	/** @param amount The amount of Dogeshit to stake. Note 1 dSHT = 1000000000
			@notice This function will stake the specified amount of Dogeshit.
	*/
	function deposit_stake(uint256 amount) public {
		distribute();
		stake[msg.sender] = stake[msg.sender] + amount;
		reward_tally[msg.sender] = reward_tally[msg.sender] + reward_per_token.multiplyDecimalRoundPrecise(amount.decimalToPreciseDecimal());
		DogeShit.transferFrom(msg.sender, address(this), amount);
		total_stake = total_stake + amount;
	}

	/** @notice This function will calculate the current reward per token. This doesn't send any token, it simply updates the values used
				to calculate what is required to be sent. This is called before any stake is deposited, withdrawn, or rewards are claimed.
				So while you can call this function if you choose to do so, you'll simply spend gas on an operation that should be handled when it is needed to be.
	*/
	function distribute() public {
		if (total_stake == 0) {
			reward_per_token = 0;
			last_reward_block = block.number;
		}
		else if ( last_reward_block < block.number) {
			/*
			uint256 rpb = reward_per_block();
		  uint256 blocks = block.number - last_reward_block;
		  uint256 rewards = blocks*rpb;
			uint256 preciseNewRewards = rewards.divideDecimalRoundPrecise(total_stake);
		  reward_per_token = reward_per_token + preciseNewRewards;
			*/
			reward_per_token = reward_per_token +
				((block.number - last_reward_block) * reward_per_block()).decimalToPreciseDecimal().divideDecimalRoundPrecise(total_stake.decimalToPreciseDecimal());
			last_reward_block = block.number;
		}
	}

	/** @param account The address of the account to see the currently unclaimed rewards.
			@return uint256  The amount of unclaimed rewards for the given account.
			@notice Get the amount of unclaimed rewards for the given account.
			@dev This view assumes that <code>distribute</code> has not been called, and should be used
					for displaying the unclaimed rewards publically. This avoids needlessly updating the state
					to simply see the outstanding rewards.
	*/
	function unclaimed_reward(address account) public view returns (uint256) {
		/*
		if ( total_stake == 0 ) {
			return 0;
		}
		uint256 rpb = reward_per_block();
		uint256 blocks = block.number - last_reward_block;
		uint256 rewards = blocks*rpb;
		uint256 _reward_per_token = reward_per_token + rewards.divideDecimalRoundPrecise(total_stake);
		uint256 _total_rewards = stake[account].multiplyDecimalRoundPrecise(_reward_per_token);
		return preciseDecimalToDecimal(_total_rewards) - reward_tally[account];
		return stake[account].multiplyDecimalRound(_reward_per_token) - reward_tally[account];
		*/
		return total_stake > 0 ? (stake[account].decimalToPreciseDecimal().multiplyDecimalRoundPrecise(
			reward_per_token +
			 ((block.number-last_reward_block) * reward_per_block()).decimalToPreciseDecimal().divideDecimalRoundPrecise(total_stake.decimalToPreciseDecimal()))
		- reward_tally[account]).preciseDecimalToDecimal() : 0;
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

	function reward_split(uint256 cutoff, uint last, uint current) private view returns(uint256) {
		if (genesis + cutoff - last_reward_block > 0) {
			uint256 blocksSince = block.number - last_reward_block;
			uint256 blocksBefore = cutoff + genesis - last_reward_block;
			uint256 blocksAfter = block.number - cutoff - genesis;
			return ((last*blocksBefore + current*blocksAfter)/blocksSince) * 10**9;
	}
	else {
		return current * 10**9;
	}
	}

	/** @notice The total amount of rewards that will be distributed to the pool with each block.
			@return uint256  The current total number of rewards per block.
	*/
	function reward_per_block() public view returns (uint256) {
		uint256 blockNum = block.number - genesis;
		if ( blockNum < 3000000 ) {
			return 9696*10**9;
		}
		else if ( blockNum < 6000000 ) {
			return reward_split(3000000, 9696, 6969);
		}
		else if ( blockNum < 9000000 ) {
			return reward_split(6000000, 6969, 3693);
		}
		else if ( blockNum < 12000000 ) {
			return reward_split(9000000, 3693, 1337);
		}
		else if ( blockNum < 15000000 ) {
			return reward_split(12000000, 1337, 969);
		}
		else if ( blockNum < 17400000 ) {
			return reward_split(15000000, 1337, 420);
		}
		else if ( blockNum < 34800000 ) {
			return reward_split(17400000, 420, 69);
		}
		else if ( blockNum < 55000000 ) {
			return reward_split(34800000, 69, 42);
		}
		else if ( blockNum < 75000000 ) {
			return reward_split(55000000, 42, 13);
		}
		else if ( blockNum < 100000000 ) {
			return reward_split(75000000, 42, 9);
		}
		else if ( blockNum < 125000000 ) {
			return reward_split(100000000, 9, 6);
		}
		else if ( blockNum < 150000000 ) {
			return reward_split(125000000, 6, 4);
		}
		else if ( blockNum < 200000000 ) {
			return reward_split(150000000, 4, 2);
		}
		else {
			return reward_split(200000000, 2, 1);
		}
	}
}
