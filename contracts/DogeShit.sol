// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "./interfaces/IShitPile.sol";

contract DogeShit is AccessControl, ERC20 {

	bytes32 public constant SHIT_MAKER_ROLE = keccak256("SHIT_MAKER_ROLE");
	bytes32 public constant SHIT_BURNER_ROLE = keccak256("SHIT_BURNER_ROLE");

	address public rewardsPool;


	constructor(address _shitMaker, address _rewardsPool) ERC20("DogeShit", "dSHT") {
		_setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
		_setupRole(SHIT_MAKER_ROLE, _shitMaker);
		_setupRole(SHIT_BURNER_ROLE, _rewardsPool);
		grantRole(SHIT_MAKER_ROLE, _rewardsPool);
		renounceRole(DEFAULT_ADMIN_ROLE, msg.sender);
		rewardsPool = _rewardsPool;
	}

	function mint(address to, uint256 amount) public onlyRole(SHIT_MAKER_ROLE) {
		_mint(to, amount);
	}

	function burn(address from, uint256 amount) public onlyRole(SHIT_BURNER_ROLE) {
		_burn(from, amount);
	}

}
