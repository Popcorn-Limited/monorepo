import { HardhatRuntimeEnvironment } from "hardhat/types";

import { networkMap } from "./constants";
import namedAccounts from "./namedAccounts.json";

export const getNamedAccountsFromNetwork = (hre: HardhatRuntimeEnvironment) => {
  return Object.keys(namedAccounts).reduce((map, contract) => {
    let network = hre.network.name;
    if (!namedAccounts[contract].addresses[hre.network.name]) {
      network = hre.network.name == "hardhat" ? "mainnet" : hre.network.name;
    }
    if (!namedAccounts[contract].addresses[network]) return map;

    return {
      ...map,
      [contract]: namedAccounts[contract].addresses[network],
    };
  }, {} as any);
};

export const getNamedAccountsByChainId = (chainId: number) => {
  const network: string = networkMap[chainId] ? networkMap[chainId] : "hardhat";
  return Object.keys(namedAccounts).reduce((map, contract) => {
    if (!namedAccounts[contract].addresses[network]) return map;
    return {
      ...map,
      [contract]: namedAccounts[contract].addresses[network],
    };
  }, {} as any);
};
