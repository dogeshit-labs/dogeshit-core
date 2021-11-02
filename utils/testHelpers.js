const BlockMiner = artifacts.require("BlockMiner");

function mineBlocks(address, n) {
  return new Promise(function(resolve) {
    BlockMiner.deployed().then(function(blockMiner) {
      var miners = [];
      for (var ii = 0; ii < n; ii++) {
        miners.push(blockMiner.mine({ from: address }));
      }
      return Promise.all(miners).then(resolve);
    });
  });
}

function makeRoleRevertMessage(account, role) {
  return (
    "AccessControl: account " +
    account.toLowerCase() +
    " is missing role " +
    role +
    "."
  );
}

module.exports = { makeRoleRevertMessage, mineBlocks };
