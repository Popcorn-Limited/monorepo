import SuccessfulStakingModal from "@popcorn/app/components/staking/SuccessfulStakingModal";
import { setMultiChoiceActionModal } from "@popcorn/components/context/actions";
import { store } from "@popcorn/components/context/store";
import useBalanceAndAllowance from "@popcorn/app/hooks/staking/useBalanceAndAllowance";
import useStakingPool from "@popcorn/app/hooks/staking/useStakingPool";
import useTokenPrices from "@popcorn/app/hooks/tokens/useTokenPrices";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import StakeInterface, { defaultForm, InteractionType } from "@popcorn/app/components/staking/StakeInterface";
import StakeInterfaceLoader from "@popcorn/app/components/staking/StakeInterfaceLoader";
import { useChainIdFromUrl } from "@popcorn/app/hooks/useChainIdFromUrl";
import { useTransaction } from "@popcorn/app/hooks/useTransaction";
import { ethers } from "ethers";

export default function StakingPage(): JSX.Element {
  const { account, signer } = useWeb3();
  const chainId = useChainIdFromUrl();
  const router = useRouter();
  const { dispatch } = useContext(store);
  const [form, setForm] = useState(defaultForm);
  const {
    data: stakingPool,
    error: stakingPoolError,
    mutate: refetchStakingPool,
    isValidating,
  } = useStakingPool(router.query.id as string, chainId);
  const balances = useBalanceAndAllowance(stakingPool?.stakingToken.address, account, stakingPool?.address, chainId);
  const stakingToken = stakingPool?.stakingToken;
  const { data: tokenPriceData, isValidating: tokenPriceValidating } = useTokenPrices([stakingToken?.address], chainId);
  const tokenPrice = tokenPriceData?.[stakingToken?.address?.toLowerCase()];
  const isLoading = !stakingPool && (isValidating || tokenPriceValidating);
  const transaction = useTransaction(chainId);

  useEffect(() => {
    if (stakingPoolError) {
      router.push("/staking");
    }
  }, [stakingPoolError]);

  function stake(): void {
    transaction(
      () => stakingPool.contract.connect(signer).stake(form.amount),
      `Staking ${stakingToken?.symbol} ...`,
      `${stakingToken?.symbol} staked!`,
      () => {
        setForm(defaultForm);
        refetchStakingPool();
        balances.revalidate();
        if (!localStorage.getItem("hideStakeSuccessPopover")) {
          dispatch(
            setMultiChoiceActionModal({
              title: `Successfully staked ${stakingToken?.symbol}`,
              children: SuccessfulStakingModal,
              image: <img src="/images/modalImages/successfulStake.svg" />,
              onConfirm: {
                label: "Continue",
                onClick: () => dispatch(setMultiChoiceActionModal(false)),
              },
              onDontShowAgain: {
                label: "Do not remind me again",
                onClick: () => {
                  localStorage.setItem("hideStakeSuccessPopover", "true");
                  dispatch(setMultiChoiceActionModal(false));
                },
              },
              onDismiss: {
                onClick: () => {
                  dispatch(setMultiChoiceActionModal(false));
                },
              },
            }),
          );
        }
      },
    );
  }

  function withdraw(): void {
    transaction(
      () => stakingPool.contract.connect(signer).withdraw(form.amount),
      `Withdrawing ${stakingToken?.symbol} ...`,
      `${stakingToken?.symbol} withdrawn!`,
      () => {
        setForm({ ...defaultForm, type: InteractionType.Withdraw });
        refetchStakingPool();
        balances.revalidate();
      },
    );
  }

  function approve(): void {
    transaction(
      () => stakingToken.contract.connect(signer).approve(stakingPool.address, ethers.constants.MaxUint256),
      `Approving ${stakingToken?.symbol} ...`,
      `${stakingToken?.symbol} approved!`,
      () => balances.revalidate(),
    );
  }

  return isLoading ? (
    <StakeInterfaceLoader />
  ) : (
    <StakeInterface
      stakingPool={stakingPool}
      user={balances}
      form={[form, setForm]}
      stake={stake}
      withdraw={withdraw}
      approve={approve}
      onlyView={!account}
      chainId={chainId}
      account={account}
      stakedTokenPrice={tokenPrice}
    />
  );
}
