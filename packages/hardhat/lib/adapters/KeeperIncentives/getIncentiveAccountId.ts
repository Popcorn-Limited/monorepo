import { ethers, utils } from "ethers";

export const getIncentiveAccountId = (contractAddress: string, incentiveIndex: number, rewardToken: string) => {
  return utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256", "address"],
      [contractAddress, incentiveIndex, rewardToken]
    )
  );
};
