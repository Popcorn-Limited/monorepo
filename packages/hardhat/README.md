## Hardhat

## Prerequisites

1. [yarn](https://yarnpkg.com/)
2. [foundry](https://github.com/foundry-rs/foundry)
3. [cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html)

## Installation instructions

1. copy .env.example to .env in root directory and fill out env vars

```
RPC=https://rpc-node-goes-here
FORKING_RPC_URL=https://rpc-node-goes-here
NEXT_ALCHEMY_API_KEY="get alchemy key from alchemy.com"
```

Then run the following

```
$ yarn
$ cd lib/utils/exporter; cargo build --release;
$ cd ../../..; yarn dev
```

After the hardhat node is running:

```
$ yarn export
```

you will now be able to run the app:

```
$ cd ../greenfield-app; yarn dev
```
