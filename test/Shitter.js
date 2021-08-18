const Shitter = artifacts.require("Shitter")
const DogeShit = artifacts.require("DogeShit")
const FakeDoge = artifacts.require("FakeDoge")

contract("Shitter test", async accounts => {
  it("Should have 1 doge address; should be FakeDoge")
  it("Should have specific address in the adder role.")
  it("Should have specific address in the killer role.")
  it("Should possibly have deploying address in the init role.")
  it("Should possibly have DogeShit defined")
  it("Should mint 1:1 FakeDoge for DogeShit; FakeDoge should be burned")
  it("Only adder should be able to add doge address")
  it("Only killer should be able to remove doge address")
  it("Only init(deployer) should be able to set dogeshit.")
  it("After setting dogeshit; no one should have init role.")
});
