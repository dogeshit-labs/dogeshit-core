// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

contract BlockMiner {
    uint public blocksMined;

    constructor() {
        blocksMined = 0;
    }

    function mine() public {
        blocksMined += 1;
    }
}
