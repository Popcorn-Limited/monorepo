import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getNamedAccountsFromNetwork } from "./getNamedAccounts";

export const getContractWithSigner = async (
  hre: HardhatRuntimeEnvironment,
  contractReferenceInNamedAccounts: string,
  contractName: string
) => {
  const signer = hre.ethers.provider.getSigner();
  const { [contractReferenceInNamedAccounts]: contractAddress } = getNamedAccountsFromNetwork(hre);
  return await hre.ethers.getContractAt(contractName, contractAddress, signer);
};
