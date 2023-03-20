#!/usr/bin/env bash

cast rpc anvil_impersonateAccount 0xF977814e90dA44bFA03b6295A0616a897441aceC --rpc-url localhost:8545 && cast send 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 --rpc-url localhost:8545 \
--from 0xF977814e90dA44bFA03b6295A0616a897441aceC \
  "transfer(address,uint256)(bool)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  100000000000