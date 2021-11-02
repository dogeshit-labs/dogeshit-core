const FakeDoge = artifacts.require("FakeDoge");
const OtherDoge = artifacts.require("OtherDoge");
const ShitLock = artifacts.require("ShitLock");
const ShitLord = artifacts.require("ShitLord");
const DogeShit = artifacts.require("DogeShit");
const ShitFountain = artifacts.require("ShitFountain");
const BlockMiner = artifacts.require("BlockMiner");

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
                    .then(function() {
                      return deployer.deploy(BlockMiner);
                    });
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

  if (network === "mainnet") {
    let doge_deployer = "0xddbc6a6a045e52fd2c0cfdeb882129a24ab8bb23";
    let ren_bridge = "0x6c7ba6c44871655968e2ae85116becb79c6ac352";
    let bsc_bridge = "0xf155e1a57db0ca820ae37ab4050e0e4c7cfcecd0";
    await deployerer
      .deploy(ShitLock, 604800, [doge_deployer], [doge_deployer])
      .then(function() {
        return deployer
          .deploy(ShitLord, ShitLock.address, [ren_bridge, bsc_bridge])
          .then(function() {
            return deployer.deploy(ShitFountain).then(function() {
              return deployer
                .deploy(DogeShit, ShitLord.address, ShitFountain.address)
                .then(function() {});
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
