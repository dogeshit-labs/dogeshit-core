const OtherDoge = artifacts.require("OtherDoge");

contract("OtherDoge initialization", async (accounts) => {
  it("Should have 8 decimals", async () =>
    OtherDoge.deployed()
      .then((instance) => instance.decimals())
      .then((decimals) => {
        assert.equal(decimals.valueOf(), 8, "The number of decimals wasn't 8");
      }));

  it("Should initially have 6900 OtherDoge", async () =>
    OtherDoge.deployed()
      .then((instance) => instance.totalSupply())
      .then((supply) => {
        assert.equal(
          supply.valueOf(),
          6900 * 10 ** 8,
          "The initial supply wasn't 6900 OtherDoge"
        );
      }));

  it("Deployer should have all tokens", async () =>
    OtherDoge.deployed()
      .then((instance) => instance.balanceOf(accounts[0]))
      .then((balance) => {
        assert.equal(
          balance.valueOf(),
          6900 * 10 ** 8,
          "The deployer account did not have 6900 OtherDoge"
        );
      }));
});
