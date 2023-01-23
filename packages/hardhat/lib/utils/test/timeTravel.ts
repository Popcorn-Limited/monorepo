import { ethers } from "hardhat";
import { DAYS } from "./constants";

export const timeTravel = async (time?: number) => {
  await ethers.provider.send("evm_increaseTime", [time || 1 * DAYS]);
  await ethers.provider.send("evm_mine", []);
};
