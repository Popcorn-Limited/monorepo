import { Signer, Wallet } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function getSignerFrom(
  from: string,
  hre: HardhatRuntimeEnvironment
): Promise<Signer> {
  if (from.startsWith("privateKey://")) {
    return new Wallet(from.substr(13), hre.ethers.provider);
  }
  if (from.length >= 64) {
    if (from.length === 64) {
      from = "0x" + from;
    }
    return new Wallet(from, hre.ethers.provider);
  }

  return hre.ethers.provider.getSigner(from);
}
