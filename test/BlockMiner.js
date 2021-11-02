const { mineBlocks } = require("../utils/testHelpers");

contract("BlockMiner works as expected", async (accounts) => {
  it("Should mine ahead 25 blocks", async () => {
    let startingBlock = await web3.eth.getBlockNumber();

    mineBlocks(accounts[0], 25).then(() => {
      return web3.eth
        .getBlockNumber()
        .then((currentBlock) =>
          assert.equal(
            currentBlock - startingBlock,
            25,
            "Incorrect amount of mined blocks"
          )
        );
    });
  });
});
