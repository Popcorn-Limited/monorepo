import { PopLocker, Staking } from "@popcorn/hardhat/typechain";
import { BigNumber, constants } from "ethers";
import { getPopApy, calculateApy } from "./calculateAPY";
import { getTokenFromAddress } from "./getToken";
import { StakingPool } from "@popcorn/utils/types";

export interface PopLockerMetadata extends StakingPool {
  contract: PopLocker;
}

export interface StakingPoolMetadata extends StakingPool {
  contract: Staking;
}

export async function getStakingPool(
  key: string,
  account: string,
  staking: Staking,
  chainId: number,
  rpcProvider,
  contractAddresses,
): Promise<StakingPoolMetadata> {
  const tokenAddress = await staking.stakingToken();
  const totalStake = await staking.totalSupply();
  const tokenPerWeek = await staking.getRewardForDuration();
  const apy = await calculateApy(tokenAddress, tokenPerWeek, totalStake, chainId, rpcProvider, contractAddresses);
  const earned = account ? await staking.earned(account) : constants.Zero;
  const userStake = account ? await staking.balanceOf(account) : constants.Zero;
  const stakingToken = await getTokenFromAddress(tokenAddress, rpcProvider, chainId);
  return {
    contract: staking,
    address: staking.address,
    tokenAddress,
    apy,
    userStake,
    totalStake,
    tokenEmission: tokenPerWeek?.div(7) || constants.Zero,
    earned,
    stakingToken,
  };
}

export async function getPopLocker(
  key: string,
  popLocker: PopLocker,
  chainId: number,
  account?: string,
): Promise<PopLockerMetadata> {
  const tokenAddress = await popLocker.stakingToken();
  const totalStake = await popLocker.lockedSupply();
  const tokenPerWeek = await popLocker.getRewardForDuration(tokenAddress);
  const apy = await getPopApy(tokenPerWeek, totalStake);
  const userRewards = account ? await popLocker.claimableRewards(account) : [{ amount: constants.Zero }];
  const earned = userRewards && userRewards.length > 0 ? userRewards[0].amount : constants.Zero;
  const userStake = account ? await popLocker.lockedBalanceOf(account) : constants.Zero;
  const withdrawable = account ? (await popLocker.lockedBalances(account)).unlockable : constants.Zero;
  let lockedBalances = account
    ? (await popLocker.lockedBalances(account)).lockData.map((lockedBalanceStruct) => ({
        amount: lockedBalanceStruct.amount,
        boosted: lockedBalanceStruct.boosted,
        unlockTime: lockedBalanceStruct.unlockTime,
      }))
    : [];
  const stakingToken = await getTokenFromAddress(tokenAddress, popLocker.provider, chainId);

  return {
    contract: popLocker,
    address: popLocker.address,
    tokenAddress,
    apy,
    userStake,
    totalStake,
    tokenEmission: tokenPerWeek?.div(7) || BigNumber.from(0),
    earned,
    withdrawable,
    lockedBalances,
    stakingToken,
  };
}
