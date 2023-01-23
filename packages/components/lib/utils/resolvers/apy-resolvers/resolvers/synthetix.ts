import { BigNumber, Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { resolve_price } from "../../price-resolvers/resolve_price";

export async function synthetix(address, chainId, rpc?): Promise<{ value: BigNumber; decimals: number }> {
  chainId = Number(chainId);
  const contract = new Contract(
    address,
    [
      "function rewardsDuration() external view returns (uint256)", // in seconds
      "function getRewardForDuration() external view returns (uint256)",
      "function totalSupply() external view returns (uint256)",
      "function stakingToken() external view returns (address)",
      "function rewardsToken() external view returns (address)",
    ],
    rpc,
  );

  const [rewardsDuration, rewardForDuration, totalSupply, stakingToken, rewardsToken] = await Promise.all([
    contract.rewardsDuration(),
    contract.getRewardForDuration(),
    contract.totalSupply(),
    contract.stakingToken(),
    contract.rewardsToken(),
  ]);

  const [stakingTokenPrice, rewardsTokenPrice] = await Promise.all([
    resolve_price({ address: stakingToken, chainId, rpc }),
    resolve_price({ address: rewardsToken, chainId, rpc }),
  ]);

  const totalSupplyValue = totalSupply.mul(stakingTokenPrice.value).div(parseUnits("1", stakingTokenPrice.decimals));

  const rewardsValuePerPeriod = rewardForDuration
    .mul(rewardsTokenPrice.value)
    .div(parseUnits("1", rewardsTokenPrice.decimals));

  const rewardsValuePerYear = BigNumber.from(365 * 24 * 60 * 60)
    .div(rewardsDuration)
    .mul(rewardsValuePerPeriod);

  const apy = rewardsValuePerYear.mul(parseEther("100")).div(totalSupplyValue);

  return { value: apy, decimals: 18 };
}
