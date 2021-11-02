// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/** @title DogeShit
		@notice DogeShit is an ERC20 token, designed so only 2 specified addresses have the ability to mint Dogeshit.
		@dev Dogeshit should be deployed after the ShitFountain and ShitLord contracts have been deployed,
			as these contracts should be the only two contracts with the ability to mint Dogeshit.
*/
contract DogeShit is AccessControlEnumerable, ERC20 {

	bytes32 public constant SHIT_MAKER_ROLE = keccak256("SHIT_MAKER_ROLE");

	/** @param _shitMaker  The address of the ShitLord contract.
			@param _rewardsPool  The address of the ShitFountain contract.
	*/
	constructor(address _shitMaker, address _rewardsPool) ERC20("DogeShit", "dSHT") {
		_setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
		_setupRole(SHIT_MAKER_ROLE, _shitMaker);
		grantRole(SHIT_MAKER_ROLE, _rewardsPool);
		renounceRole(DEFAULT_ADMIN_ROLE, msg.sender);
	}

	/** @param to  The address to mint the tokens to.
			@param amount  The amount of tokens to mint. Note 1 dSHT = 1000000000
			@notice Minting can only be called by the addresses specified as the ShitLord and ShitFountain.
	*/
	function mint(address to, uint256 amount) public onlyRole(SHIT_MAKER_ROLE) {
		_mint(to, amount);
	}

	/** @return uint8  9 */
	function decimals() public view virtual override returns (uint8) {
        return 9;
  }
}
