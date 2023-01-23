import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { getErc20, impersonateSigner, sendEth } from ".";

export const transferErc20 = async (
  token: string,
  from: string,
  to: string,
  amount: string
) => {
  if ((await ethers.provider.getBalance(from)).lt(parseEther(".05"))) {
    await sendEth(from, ".05");
  }
  const erc20 = await getErc20(token, await impersonateSigner(from));

  return erc20.transfer(to, parseUnits(amount, await erc20.decimals()));
};
