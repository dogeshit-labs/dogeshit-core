const NotDoge = artifacts.require("NotDoge");
const FakeDoge = artifacts.require("FakeDoge");
const OtherDoge = artifacts.require("OtherDoge");
const ShitLock = artifacts.require("ShitLock");
const ShitLord = artifacts.require("ShitLord");
const DogeShit = artifacts.require("DogeShit");
const ShitFountain = artifacts.require("ShitFountain");
const FastFountain = artifacts.require("FastFountain");
const FastLord = artifacts.require("FastLord");
const FastShit = artifacts.require("FastShit");
const BlockMiner = artifacts.require("BlockMiner");

const fountainRewards = [
  9696000000000,
  6969000000000,
  3693000000000,
  1337000000000,
  420000000000,
  69000000000,
  42000000000,
  13000000000,
  9000000000,
  6000000000,
  4000000000,
  2000000000,
  1000000000,
];
const fastFoutainCutoffs = [
  30,
  60,
  90,
  120,
  150,
  174,
  348,
  550,
  750,
  1000,
  1250,
  1500,
  2000,
];
const fastFountainDelay = 0;

module.exports = async function(deployer, network, accounts) {
  if (
    network === "ganache" ||
    network === "oldlocal" ||
    network === "develop"
  ) {
    let doge_deployer = accounts[0];
    await deployer.deploy(OtherDoge);
    let otherDoge = await OtherDoge.deployed();
    await deployer.deploy(FakeDoge);
    let fakeDoge = await FakeDoge.deployed();
    await deployer.deploy(ShitLock, 604800, [doge_deployer], [doge_deployer]);
    let shitLock = await ShitLock.deployed();
    await deployer.deploy(ShitLord, shitLock.address, [
      fakeDoge.address,
      otherDoge.address,
    ]);
    let shitLord = await ShitLord.deployed();
    await deployer.deploy(FastLord, shitLock.address, [
      fakeDoge.address,
      otherDoge.address,
    ]);
    let fastLord = await FastLord.deployed();
    await deployer.deploy(ShitFountain);
    let shitFountain = await ShitFountain.deployed();
    await deployer.deploy(DogeShit, shitLord.address, shitFountain.address);
    let dogeShit = await DogeShit.deployed();
    await deployer.deploy(
      FastFountain,
      fountainRewards,
      fastFoutainCutoffs,
      fastFountainDelay
    );
    let fastFountain = await FastFountain.deployed();
    await deployer.deploy(FastShit, fastLord.address, fastFountain.address);
    let fastShit = await FastShit.deployed();

    await deployer.deploy(BlockMiner);
    await deployer.deploy(NotDoge);

    await shitLord.set_dogeshit(dogeShit.address);
    await shitFountain.init_shit(dogeShit.address);

    await fastLord.set_dogeshit(fastShit.address);
    await fastFountain.init_shit(fastShit.address);
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
