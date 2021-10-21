// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.0;

import "./interfaces/IDogeShit.sol";
import "./DecimalMath.sol";

contract ShitFountain {

	using DecimalMath for uint256;

	address public constant pit = 0x7bDeF7Bdef7BDeF7BDEf7bDef7bdef7bdeF6E7AD;

	IDogeShit public DogeShit;

	uint256 public genesis;
	uint256 public total_stake = 0; // int
	uint256 public last_reward_block = 0; // int
	uint256 public reward_per_token = 0; // PreciseDecimal

	mapping(address => uint256) public stake; // int
	mapping(address => uint256) public reward_tally; //int

	function init_shit(address shit_address) public {
		DogeShit = IDogeShit(shit_address);
		genesis = block.number;
		last_reward_block = block.number;
	}

	function deposit_stake(uint256 amount) public {
		distribute();
		stake[msg.sender] = stake[msg.sender] + amount;
		reward_tally[msg.sender] = reward_tally[msg.sender] + reward_per_token.multiplyDecimalRoundPrecise(amount.decimalToPreciseDecimal()).preciseDecimalToDecimal();
		DogeShit.transferFrom(msg.sender, address(this), amount);
		total_stake = total_stake + amount;
	}

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
			 ((block.number-last_reward_block) * reward_per_block()).decimalToPreciseDecimal().divideDecimalRoundPrecise(total_stake.decimalToPreciseDecimal()))).preciseDecimalToDecimal()
		- reward_tally[account] : 0;
	}

	function compute_reward(address account) public view returns (uint256) {
		return (stake[account].decimalToPreciseDecimal().multiplyDecimalRoundPrecise(reward_per_token)).preciseDecimalToDecimal() - reward_tally[account];
	}

	function withdraw_rewards() public {
		distribute();
		uint256 reward = compute_reward(msg.sender);
		if ( reward > 0 ) {
			reward_tally[msg.sender] = (stake[msg.sender].decimalToPreciseDecimal().multiplyDecimalRoundPrecise(reward_per_token)).preciseDecimalToDecimal();
			DogeShit.mint(msg.sender, reward);
			//DogeShit.transfer(msg.sender, reward);
		}
	}

	function withdraw_stake(uint256 amount) public {
		require(amount <= stake[msg.sender], "Amount requested is more than currently staked.");
		withdraw_rewards();
		stake[msg.sender] = stake[msg.sender] - amount;
		reward_tally[msg.sender] = reward_tally[msg.sender] - (reward_per_token.multiplyDecimalRoundPrecise(amount.decimalToPreciseDecimal())).preciseDecimalToDecimal();
		total_stake = total_stake - amount;
		DogeShit.transfer(msg.sender, amount);
	}

	function reward_per_block() public view returns (uint256) {
		if ( block.number - genesis < 0 ) {
			return 0;
		}
		else if ( block.number - genesis < 3000000 ) {
			return 9696*10**9;
		}
		else if ( block.number - genesis < 6000000 ) {
			return 6969*10**9;
		}
		else if ( block.number - genesis < 9000000 ) {
			return 3693*10**9;
		}
		else if ( block.number - genesis < 12000000 ) {
			return 1337*10**9;
		}
		else if ( block.number - genesis < 15000000 ) {
			return 969*10**9;
		}
		else if ( block.number - genesis < 17400000 ) {
			return 420*10**9;
		}
		else if ( block.number - genesis < 34800000 ) {
			return 69*10**9;
		}
		else if ( block.number - genesis < 55000000 ) {
			return 42*10**9;
		}
		else if ( block.number - genesis < 75000000 ) {
			return 13*10**9;
		}
		else if ( block.number - genesis < 100000000 ) {
			return 9*10**9;
		}
		else if ( block.number - genesis < 125000000 ) {
			return 6*10**9;
		}
		else if ( block.number - genesis < 150000000 ) {
			return 4*10**9;
		}
		else if ( block.number - genesis < 200000000 ) {
			return 2*10**9;
		}
		else {
			return 1*10**9;
		}
	}
}
