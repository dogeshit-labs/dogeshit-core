const FakeDoge = artifacts.require("FakeDoge");

contract("FakeDoge inialization", async (accounts) => {
  it("Should have 8 decimals", async () =>
    FakeDoge.deployed()
      .then((instance) => instance.decimals())
      .then((decimals) => {
        assert.equal(decimals.valueOf(), 8, "The number of decimals wasn't 8");
      }));

  it("Should initially have 420 FakeDoge", async () =>
    FakeDoge.deployed()
      .then((instance) => instance.totalSupply())
      .then((supply) => {
        assert.equal(
          supply.valueOf(),
          420 * 10 ** 8,
          "The initial supply wasn't 420 FakeDoge"
        );
      }));

  it("Deployer should have all tokens", async () =>
    FakeDoge.deployed()
      .then((instance) => instance.balanceOf(accounts[0]))
      .then((balance) => {
        assert.equal(
          balance.valueOf(),
          420 * 10 ** 8,
          "The deployer account did not have 420 FakeDoge"
        );
      }));
});
