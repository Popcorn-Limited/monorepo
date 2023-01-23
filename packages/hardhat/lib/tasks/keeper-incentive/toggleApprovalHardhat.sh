#!/usr/bin/env bash

yarn hardhat keeper-incentive:toggleApproval --network localhost --contract ButterBatchProcessing --index 0

yarn hardhat keeper-incentive:toggleApproval --network localhost --contract ButterBatchProcessing --index 1

yarn hardhat keeper-incentive:toggleApproval --network localhost --contract ThreeXBatchProcessing --index 0

yarn hardhat keeper-incentive:toggleApproval --network localhost --contract ThreeXBatchProcessing --index 1