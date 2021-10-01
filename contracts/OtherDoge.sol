// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OtherDoge is ERC20 {
	constructor() ERC20("OtherDoge", "oDOGE") {
		_mint(msg.sender, 6900*10**8);
	}

	function decimals() public view virtual override returns (uint8) {
        return 8;
  }
}
