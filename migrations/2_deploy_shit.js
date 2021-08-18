const FakeDoge = artifacts.require("FakeDoge");
const OtherDoge = artifacts.require("OtherDoge");
const ShitLord = artifacts.require("ShitLord");
const DogeShit = artifacts.require("DogeShit");
const ShitFountain = artifacts.require("ShitFountain");

module.exports = async function(deployer, network, accounts) {
  if (network === "ganache") {
    var doge_controller = accounts[0];
    await deployer.deploy(OtherDoge).then(function() {
      return deployer.deploy(FakeDoge).then(function() {
        return deployer
          .deploy(ShitLord, doge_controller, doge_controller, [
            FakeDoge.address,
            OtherDoge.address,
          ])
          .then(function() {
            return deployer.deploy(ShitFountain).then(function() {
              return deployer
                .deploy(DogeShit, ShitLord.address, ShitFountain.address)
                .then(function() {});
            });
          });
      });
    });
    const ds = await DogeShit.deployed();
    const sm = await ShitLord.deployed();
    await sm.set_dogeshit(ds.address);
    const sp = await ShitFountain.deployed();
    await sp.init_shit(ds.address);
  }
};
