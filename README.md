# Popcorn

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/8af04768693b48bb9c84120bfde78d92)](https://app.codacy.com/gh/popcorndao/workspace?utm_source=github.com&utm_medium=referral&utm_content=popcorndao/workspace&utm_campaign=Badge_Grade_Settings)

- [Popcorn](#popcorn)
  - [Technology Used](#technology-used)
  - [Directory structure](#directory-structure)
  - [Prerequisites](#prerequisites)
  - [Getting started with development](#getting-started-with-development)
  - [Getting started with Frontend](#getting-started-with-frontend)
  - [Getting started with Contracts](#getting-started-with-contracts)
  - [Default Service Locations](#default-service-locations)
  - [Useful Commands](#useful-commands)
  - [Common Issues](#common-issues)
  - [Contributing](#contributing)

## Technology Used

- [Next.js](https://nextjs.org/)
- [Lerna](https://lerna.js.org)
- [Yarn](https://yarnpkg.com)
- [Storybook](https://storybook.js.org/)
- [TailwindCss](https://tailwindcss.com/)
- [Solidity](https://soliditylang.org)
- [Hardhat](https://hardhat.org)
- [React testing library](https://testing-library.com/docs/react-testing-library/intro/)

## Directory structure

```
packages
├── app            [@popcorn/app]          [next.js]
├── hardhat        [@popcorn/hardhat]      [solidity contracts & typechain]
├── utils          [@popcorn/utils]        [generic utils]
├── ui             [@popcorn/ui]           [ui components + storybook]
└── ... etc
```

## Prerequisites

1. Install packages:
   - `curl -L https://foundry.paradigm.xyz | bash` 
   - in packages/hardhat `foundryup`
   - in packages/hardhat `cargo build --manifest-path lib/utils/exporter/Cargo.toml --release`
   - `yarn install`


2. Update .env
   1. `RPC_URL` is used to run a local node and can be set to `http://localhost:8545` 
   2. `FORKING_RPC_URL` is used to run fork tests and deploy contracts on a historic state of the chain. Create a free [Alchemy](https://www.alchemy.com/) account and use their API or use your own node.
   3. `INFURA_PROJECT_ID` is used to fetch data for the frontend. A paid multichain [Infura](https://infura.io/) account is needed.
   4. `CHAIN_ID` is the default chainId used by the frontend and should usually be `1337` for local development.

3. Add Metamask to your browser
4. Enable test-networks in Metamask
5. Add the Hardhat Signer with private key `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` to Metamask. This account gets all the demo funds and should be used to test the app in local development. **IMPORTANT - use this account only for local development as all funds can be stolen from this account**


## Getting started with development

1. To start a local ethereum environment and deploy all required contracts with demo data navigate into `packages/hardhat` and run:

```
yarn hardhat node --network hardhat
```

2. Then in another terminal go into `packages/app` and start the app with

```
yarn run dev
```


## Getting started with Frontend

Go to `packages/app`
1. Install packages

   - `yarn install`

2. Run dev (watch files and start up frontend)

   - `yarn run dev`

3. Start storybook (optional):
   - `yarn run story`

## Getting started with Contracts

To run tests:
go to `packages/hardhat` and run
`yarn hardhat test`

Deploy from `packages/hardhat`:

1. compile: `yarn compile`
2. and run : `yarn hardhat node --network [network]`

## Default Service Locations

| Service          | Location                    |
| ---------------- | --------------------------- |
| Next.js Frontend | http://localhost:3000       |
| Hardhat node     | http://localhost:8545       |
| Storybook        | run: `yarn lerna run story` |

## Useful Commands

| Command                              | Description                                                          |
| ------------------------------------ | -------------------------------------------------------------------- |
| `yarn install`                       | equivalent to `npm install`                                          |
| `yarn add @org/packagename`          | equivalent to `npm install` - will add to dependencies               |
| `yarn add @org/packagename -D`       | equivalent to `npm install --save-dev` - will add to devDependencies |
| `yarn clean`                         | cleans contract artifacts which are used to create typechain interfaces.

## Common Issues

**Metamask Nonce is too high** - When running a hardhat node and interacting with the frontend you might run into the issue that Metamasks Nonce is too high for a transaction. In this case you have to reset your Metamask. Go to Settings->Advanced->Reset Account. *Dont worry this just causes metamask to refetch all data from chain and doesnt temper with any funds or other settings*

**I want to reset on-chain data** - Simply stop your hardhat node and rerun the deploy script. The chain is completly reset to its base state with demo data. Dont forget to reset your metamask accoutn though.

**Unrecognized Contract/Selector** - If the frontend gives you this error your typechain types might be off or the addresses used by the frontend are wrong. 
Run `yarn clean` and rerun the node to recompile all contracts and generate new types. If this doesnt help, check in your terminal which contracts are causing the issue. Sometimes the address of a contract change on local development (usually after changes to the contract). In this case update the address of the contract in the file `getNamedAccounts.ts`. All addresses of deployed contracts are printed in the beginning of the deploy script.

## Contributing

Contributions are welcome! Please raise a pull request with your contributions.

Popcorn follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/1/4/code-of-conduct).
