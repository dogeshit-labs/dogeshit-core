// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./interfaces/IDogeShit.sol";

/** @title ShitLord
		@notice Contract responsible for converting bridged Doge into Dogeshit.
		@dev The deployer will be granted an INIT role on construction. This will be renounced once the <code>set_dogeshit</code> method is called.
*/
contract FastLord is AccessControlEnumerable, Ownable {

	address public timelock;
	address public constant pit = 0x7bDeF7Bdef7BDeF7BDEf7bDef7bdef7bdeF6E7AD;

	bytes32 public constant INIT = keccak256("INIT");

	IERC20[] public doge_contracts;

	IDogeShit internal _dogeshit;

	event DogeBurned(address doge_address, uint256 amount);
	event AddedDogeContractAddress(address doge_address);
	event RemovedDogeContractAddress(address doge_address);

	/** @param _shit_lock_addr  The address of the TimelockController contract.
			@param _doges  An array of addresses of valid bridged Dogecoin tokens.
			@dev On construction, the deployer is granted the INIT role. <code>set_dogeshit</code> should be called immediately after
				the Dogeshit contract is deployed so this role can be renounced.
	*/
	constructor(address _shit_lock_addr, address[] memory _doges) {
			_setupRole(INIT, msg.sender);
			timelock = _shit_lock_addr;

			for (uint i=0; i < _doges.length; i++) {
				doge_contracts.push(IERC20(_doges[i]));
				emit AddedDogeContractAddress(_doges[i]);
			}
	}

	/** @param _dogeshit_address  The address of the Dogeshit token contract.
		  @notice This function is only called on initial deployment, once the Dogeshit contract has been deployed.
			@dev This function is restricted to the INIT role, and once this function is called, the ownership of this contract
	       is transfered to the TimelockController, meaning any owner restricted methods called after this will be subject to
				 a 1 week time delay.
	*/
	function set_dogeshit(address _dogeshit_address) public  onlyRole(INIT) {
		_dogeshit = IDogeShit(_dogeshit_address);
		renounceRole(INIT, msg.sender);
		transferOwnership(timelock);
	}

	/** @param _doge_token_address  The address of the bridged Dogecoin token to convert.
		  @param amount  The amount of Dogecoin tokens to convert. Note, 1 Dogecoin would be 100000000.
			@notice This function will convert the desired amount of Dogecoin to Dogeshit, sending the Dogecoin
				to be burned, and the Dogeshit back to the sender. The bridged Dogecoin must be tracked as valid
				to be converted.
	*/
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

	/** @param _doge_contract  The address of a valid bridged Dogecoin.
			@notice This function will register a new contract as an valid form of Dogecoin that can be
				converted into Dogeshit.
			@dev This function is restricted to only be callable by the owner, which if Dogeshit has been
				set, is the address that was specified as the timelock controller in the constructor.
	*/
	function register_doge_contract(address _doge_contract) public onlyOwner {
		for (uint i=0; i < doge_contracts.length; i++) {
			if (address(doge_contracts[i]) == _doge_contract) {
				revert("That doge contract was already registered.");
			}
		}
		doge_contracts.push(IERC20(_doge_contract));
		emit AddedDogeContractAddress(_doge_contract);
	}

	/** @param _doge_contract  The address of a currently accepted bridged Dogecoin.
			@notice This function will deregister a currently registered form of Dogecoin that can be
				converted into Dogeshit.
			@dev This function is restricted to only be callable by the owner, which if Dogeshit has been
				set, is the address that was specified as the timelock controller in the constructor. If
				the address given is not actually in the <code>doge_contracts</code>, nothing will happen,
				and no error will be thrown.
	*/
	function remove_doge_contract(address _doge_contract) public onlyOwner {
		for (uint i=0; i < doge_contracts.length; i++) {
			if (address(doge_contracts[i]) == _doge_contract) {
				delete doge_contracts[i];
				emit RemovedDogeContractAddress(_doge_contract);
				break;
			}
		}
	}
	/** @return uint  The number of supported Doge contracts */
	function doge_contracts_count() public view returns(uint) {
		return doge_contracts.length;
	}
}

