const FakeDoge = artifacts.require("FakeDoge");
const OtherDoge = artifacts.require("OtherDoge");
const ShitLock = artifacts.require("ShitLock");
const ShitLord = artifacts.require("ShitLord");
const DogeShit = artifacts.require("DogeShit");
const ShitFountain = artifacts.require("ShitFountain");

module.exports = async function(deployer, network, accounts) {
  if (
    network === "ganache" ||
    network === "oldlocal" ||
    network === "develop"
  ) {
    let doge_deployer = accounts[0];
    await deployer.deploy(OtherDoge).then(function() {
      return deployer.deploy(FakeDoge).then(function() {
        return deployer
          .deploy(ShitLock, 604800, [doge_deployer], [doge_deployer])
          .then(function() {
            return deployer
              .deploy(ShitLord, ShitLock.address, [
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
    });
    const ds = await DogeShit.deployed();
    const sm = await ShitLord.deployed();
    await sm.set_dogeshit(ds.address);
    const sp = await ShitFountain.deployed();
    await sp.init_shit(ds.address);
  }
  if (network === "testnet") {
    let doge_deployer = "0xddbc6a6a045e52fd2c0cfdeb882129a24ab8bb23";
    await deployer.deploy(FakeDoge).then(function() {
      return deployer
        .deploy(ShitLock, 604800, [doge_deployer], [doge_deployer])
        .then(function() {
          return deployer
            .deploy(ShitLord, ShitLock.address, [FakeDoge.address])
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
