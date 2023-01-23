import { ethers } from "hardhat";
export const setTimestamp = async (timestamp: number) => {
  ethers.provider.send("evm_setNextBlockTimestamp", [timestamp]);
  ethers.provider.send("evm_mine", []);
};
