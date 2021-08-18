const ShitPile = artifacts.require("ShitPile")
const DogeShit = artifacts.require("DogeShit")
const FakeDoge = artifacts.require("FakeDoge")
const Shitter = artifacts.require("Shitter")


contract("ShitPile test", async accounts => {
  it("Stake and claim rewards", async() => {
    const fd = await FakeDoge.deployed();
    const ds = await DogeShit.deployed();
    const sp = await ShitPile.deployed();
    const sm = await ShitPile.deployed();
});
