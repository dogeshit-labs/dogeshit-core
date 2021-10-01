# Dogeshit

Dogeshit is an experiment around incetivizing the transfer of 
value from Dogecoin to a more sustainable proof of stake ecosystem.

Dogeshit is minted in a process referred to as "digestion", where bridged
Dogecoin tokens can be exchanged at any point 1 to 1 for Dogeshit tokens, although
burning the bridged Dogecoin in the process. This is the only way that Dogeshit can
initially be minted.

Dogeshit can be staked where the staking rewards are designed to mimic the early
mining rewards schedule of Dogecoin, rewarding the individuals who chose to migrate
their Dogecoin early on.

## Relevant Repositories

- [React Interface](https://github.com/dogeshit-labs/dogeshit-interface)
- [Manifesto (Non-Technical Primer)](https://github.com/dogeshit-labs/dogeshit-manifesto)

## `DogeShit.sol`

This is the base HRC20 token. It is 9 decimal places to avoid the potential of the largest Dogecoin wallet from overflowing the
staking rewards calculations that are limited to 256 bits of precision.

## `ShitLord.sol`

This is the contract that handles converting between bridged Dogecoin assets and Dogeshit. It is owned by a TimeLockController which
has the ability to propose and execute adding additional contracts that represent bridged Dogecoin.

## `ShitLock.sol`

This is the TimeLockController for handling adding/removing valid bridged Dogecoin tokens. Currently the proposer is the deployment contract,
but that role is intended to be distributed as the protocol becomes decentralized. Implementing direct token based governance runs into the 
risk of being easily overtaken due to the high concentration of Dogecoin owned by a handful of wallets.  

## `ShitFountain.sol`

This is the staking contract. It implements a scalable pull-based rewards distribution system with dynamic stake sizes.
Based on the following:
- <https://solmaz.io/2019/02/24/scalable-reward-changing/>
- <https://uploads-ssl.webflow.com/5ad71ffeb79acc67c8bcdaba/5ad8d1193a40977462982470_scalable-reward-distribution-paper.pdf>

## `FakeDoge.sol` `OtherDoge.sol`

HRC20 implementations of Dogecoin bridges for testnet and development.

The staking rewards schedule is as follows:

- Blocks 0M + 1 - 3M: 9696
- Blocks 3M + 1 - 6M: 6969
- Blocks 6M + 1 - 9M: 3693
- Blocks 9M + 1 - 12M: 1337
- Blocks 12M + 1 - 15M: 969
- Blocks 15M + 1 - 17.4M: 420

- Blocks 17.4M + 1 - 34.8M: 69
- Blocks 34.8M + 1 - 55M: 42
- Blocks 55M + 1 - 75M: 13
- Blocks 75M + 1 - 100M: 9
- Blocks 100M + 1 - 125M: 6
- Blocks 125M + 1 - 150M: 4
- Blocks 150M + 1 - 200M: 2
- Blocks 200M + 1 onward: 1

## `DecimalMath.sol`

This is a clone of [Synthetix's implementation](https://github.com/Synthetixio/synthetix/blob/master/contracts/SafeDecimalMath.sol), designed around the 9 decimal places of Dogeshit, with 27 decimal places for precise calculations.

