#!/usr/bin/env bash

yarn hardhat keeper-incentive:toggleApproval --contract ButterBatchProcessing --index 0 --network mainnet

yarn hardhat keeper-incentive:toggleApproval --contract ButterBatchProcessing --index 1 --network mainnet

yarn hardhat keeper-incentive:toggleApproval --contract ThreeXBatchProcessing --index 0 --network mainnet

yarn hardhat keeper-incentive:toggleApproval --contract ThreeXBatchProcessing --index 1 --network mainnet