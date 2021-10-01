// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./interfaces/IDogeShit.sol";

contract ShitLord is AccessControl, Ownable {

	address public init;
	address public constant pit = 0x7bDeF7Bdef7BDeF7BDEf7bDef7bdef7bdeF6E7AD;

	bytes32 public constant INIT = keccak256("INIT");

	IERC20[] public doge_contracts;

	IDogeShit internal _dogeshit;

	event DogeBurned(address doge_address, uint256 amount);
	event AddedDogeContractAddress(address doge_address);
	event RemovedDogeContractAddress(address doge_address);


	constructor(address _shit_lock_addr, address[] memory _doges) {
			_setupRole(INIT, msg.sender);
			transferOwnership(_shit_lock_addr);

			for (uint i=0; i < _doges.length; i++) {
				doge_contracts.push(IERC20(_doges[i]));
				emit AddedDogeContractAddress(_doges[i]);
			}
	}

	function set_dogeshit(address _dogeshit_address) public  onlyRole(INIT) {
		_dogeshit = IDogeShit(_dogeshit_address);
		renounceRole(INIT, msg.sender);
	}

	function make_shit(address _doge_token_address, uint256 amount) public {
		bool _exists = false;
		uint256 _idx = 0;
		for (uint i=0; i < doge_contracts.length; i++) {
			if (address(doge_contracts[i]) == _doge_token_address) {
				_exists = true;
				_idx = i;
				break;
			}
		}
		require(_exists, "The desired doge contract is not able to be made into shit.");

		doge_contracts[_idx].transferFrom(msg.sender, address(this), amount);
		_dogeshit.mint(msg.sender, amount * 10); // DOGE 8 Decimals -> dSHT 9
		doge_contracts[_idx].transfer(pit, amount);
		emit DogeBurned(_doge_token_address, amount);
	}

	function register_doge_contract(address _doge_contract) public onlyOwner {
		for (uint i=0; i < doge_contracts.length; i++) {
			if (address(doge_contracts[i]) == _doge_contract) {
				revert("That doge contract was already registered.");
			}
		}
		doge_contracts.push(IERC20(_doge_contract));
		emit AddedDogeContractAddress(_doge_contract);
	}

	function remove_doge_contract(address _doge_contract) public onlyOwner {
		for (uint i=0; i < doge_contracts.length; i++) {
			if (address(doge_contracts[i]) == _doge_contract) {
				delete doge_contracts[i];
				emit RemovedDogeContractAddress(_doge_contract);
				break;
			}
		}
	}
}

