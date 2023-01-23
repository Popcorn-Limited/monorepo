import { ethers } from "hardhat";

export const sendEth = async (to: string, amount: string) => {
  const [owner] = await ethers.getSigners();
  return owner.sendTransaction({
    to: to,
    value: ethers.utils.parseEther(amount),
  });
};
