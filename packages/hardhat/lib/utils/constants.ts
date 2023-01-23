import { ethers } from "ethers";

export const networkMap = {
  1: "mainnet",
  4: "rinkeby",
  42161: "arbitrum",
  80001: "mumbai",
  137: "polygon",
  1337: "hardhat",
  56: "bsc",
};

const {
  constants: { AddressZero },
} = ethers;

export const ADDRESS_ZERO = AddressZero;
