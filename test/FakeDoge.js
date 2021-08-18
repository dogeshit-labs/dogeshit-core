const FakeDoge = artifacts.require("FakeDoge")

contract("FakeDoge test", async accounts => {
  it("Should initially have 420", async() => {
    const fd = await FakeDoge.deployed();
    const fdSupply = await fd.totalSupply();
    assert.equal(fdSupply, 420, "There should be an initial supply of 420 FakeDoge.");
  });
});
