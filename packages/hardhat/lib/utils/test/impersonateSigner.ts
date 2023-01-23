import { Signer } from "ethers/lib/ethers";
import { ethers, network } from "hardhat";

export const impersonateSigner = async (address): Promise<Signer> => {
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });
  return ethers.getSigner(address);
};
