// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FakeDoge is ERC20 {

	constructor() ERC20("FakeDoge", "fDOGE") {
		_mint(msg.sender, 420*10**8);
	}

	function decimals() public view virtual override returns (uint8) {
        return 8;
  }
}
