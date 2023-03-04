import { BigNumber, Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ChainId } from "@popcorn/utils";

export async function convex(address, chainId, rpc?): Promise<{ value: BigNumber; decimals: number }> {
  const contract = new Contract(
    address,
    [
      "function rewardsDuration() external view returns (uint256)", // in seconds
      "function getRewardForDuration(address token) external view returns (uint256)",
      "function totalSupply() external view returns (uint256)",
      "function stakingToken() external view returns (address)",
    ],
    rpc,
  );

  const pop = await contract.stakingToken();
  /* Somehow the Convex Staking Contract breaks on optimism. Therefore we simply check the balanceOf pop token in the staking contract */
  const popContract = new Contract(pop, ["function balanceOf(address account) external view returns (uint256)"], rpc);

  const [rewardsDuration, rewardForDuration] = await Promise.all([
    contract.rewardsDuration(),
    contract.getRewardForDuration(pop),
  ]);
  const totalSupply =
    chainId === ChainId.Optimism
      ? (await popContract.balanceOf(address)).sub(parseEther("1250"))
      : await contract.totalSupply();

  const rewardsValuePerYear = BigNumber.from(365 * 24 * 60 * 60)
    .div(rewardsDuration)
    .mul(rewardForDuration);
  const apy = rewardsValuePerYear.mul(parseEther("100")).div(totalSupply);
  return { value: apy, decimals: 18 };
}