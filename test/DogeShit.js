const DogeShit = artifacts.require("DogeShit")

contract("DogeShit test", async accounts => {
  it("Should have no supply", async() => {
    const ds = await DogeShit.deployed();
    const dsSupply = await ds.totalSupply();
    assert.equal(dsSupply, 0, "There was a supply of DogeShit when there shouldn't be.");
  });
});
