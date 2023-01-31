import { BigNumber, Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { useNamedAccounts } from "@popcorn/components/lib/utils/hooks";

export async function convex(address, chainId, rpc?): Promise<{ value: BigNumber; decimals: number }> {
  chainId = Number(chainId);
  const contract = new Contract(
    address,
    [
      "function rewardsDuration() external view returns (uint256)", // in seconds
      "function getRewardForDuration(address token) external view returns (uint256)",
      "function totalSupply() external view returns (uint256)",
    ],
    rpc,
  );

  const [pop] = useNamedAccounts(chainId.toString() as any, ["pop"]);

  const [rewardsDuration, rewardForDuration, totalSupply] = await Promise.all([
    contract.rewardsDuration(),
    contract.getRewardForDuration(pop.address),
    contract.totalSupply(),
  ]);

  const rewardsValuePerYear = BigNumber.from(365 * 24 * 60 * 60)
    .div(rewardsDuration)
    .mul(rewardForDuration);

  const apy = rewardsValuePerYear.mul(parseEther("100")).div(totalSupply);

  return { value: apy, decimals: 18 };
}
