// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/** @title FakeDoge
		@notice A development ERC20 to represent a bridged Dogecoin.
 		@dev This contract was only made for use in development and testing.
*/
contract NotDoge is ERC20 {
	/** @dev On contstruction, 420 FakeDoge will be minted to the deployer. */
	constructor() ERC20("NotDoge", "nDOGE") {
		_mint(msg.sender, 420*10**8);
	}

	/** @notice 8 decimal places to coincide with Dogecoin's 8 decimal places.
			@return uint8  8
	*/
	function decimals() public view virtual override returns (uint8) {
        return 8;
  }
}
