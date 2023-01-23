import useBalanceAndAllowance from "@popcorn/app/hooks/staking/useBalanceAndAllowance";
import usePopLocker from "@popcorn/app/hooks/staking/usePopLocker";
import useERC20 from "@popcorn/app/hooks/tokens/useERC20";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import { useTransaction } from "@popcorn/app/hooks/useTransaction";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { PopLocker, Staking, XPopRedemption__factory } from "@popcorn/hardhat/typechain";
import { useMemo } from "react";
import { BigNumber, ethers } from "ethers";
import { useStakingContracts } from "@popcorn/app/hooks/useStakingContracts";
import useGetMultipleStakingPools from "@popcorn/app/hooks/staking/useGetMultipleStakingPools";

const useXPOPRedemption = (chainId) => {
  const { account, signerOrProvider, signer, connect, chains } = useWeb3();
  const {
    xPopRedemption: xPopRedemptionAddress,
    popStaking,
    xPop: xPopAddress,
    pop: popAddress,
  } = useDeployment(chainId);

  const xPopRedemption = useMemo(() => {
    if (xPopRedemptionAddress) {
      return XPopRedemption__factory.connect(xPopRedemptionAddress, signerOrProvider);
    }
  }, [chainId, account, signerOrProvider, xPopRedemptionAddress]);
  const pop = useERC20(popAddress, chainId);
  const xPop = useERC20(xPopAddress, chainId);
  const { data: popLocker, mutate: revalidatePopLocker } = usePopLocker(popStaking, chainId);
  const stakingContracts = useStakingContracts(chainId);
  const { data: stakingPools, mutate: revalidateStakingPools } = useGetMultipleStakingPools(stakingContracts, chainId);

  const balancesXPop = useBalanceAndAllowance(xPop?.address, account, xPopRedemptionAddress, chainId);
  const balancesPop = useBalanceAndAllowance(pop?.address, account, xPopAddress, chainId);

  const transaction = useTransaction(chainId);
  const revalidate = () => {
    revalidatePopLocker();
    revalidateStakingPools();
    balancesXPop.revalidate();
    balancesPop.revalidate();
  };

  async function approveXpopRedemption(): Promise<void> {
    transaction(
      async () => xPop.contract.connect(signer).approve(xPopRedemptionAddress, ethers.constants.MaxUint256),
      "Approving xPOP...",
      "xPOP approved!",
      revalidate,
    );
  }
  async function redeemXpop(amount: BigNumber): Promise<void> {
    transaction(
      async () => xPopRedemption.connect(signer).redeem(amount),
      "Redeeming xPOP...",
      "xPOP redeemed!",
      () => {
        revalidate();
        // postRedeemSuccess();
      },
    );
  }
  return {
    approveXpopRedemption,
    redeemXpop,
    balancesXPop,
    balancesPop,
    xPop,
    pop,
  };
};

export default useXPOPRedemption;
