import { parseEther } from "@ethersproject/units";
import { Dialog, Transition } from "@headlessui/react";
import {
  ChainId,
  formatAndRoundBigNumber,
  getIndexForToken,
  getMinZapAmount,
  percentageToBps,
  prepareHotSwap,
} from "@popcorn/utils";
import { BatchType, SelectedToken, Token } from "@popcorn/utils/src/types";
import BatchProgress from "@popcorn/app/components/BatchButter/BatchProgress";
import { Pages } from "@popcorn/app/components/BatchButter/ButterTokenInput";
import ClaimableBatches from "@popcorn/app/components/BatchButter/ClaimableBatches";
import MintRedeemInterface from "@popcorn/app/components/BatchButter/MintRedeemInterface";
import MobileTutorialSlider from "@popcorn/app/components/BatchButter/MobileTutorialSlider";
import StatInfoCard from "@popcorn/app/components/BatchButter/StatInfoCard";
import TutorialSlider from "@popcorn/app/components/BatchButter/TutorialSlider";
import RightArrowIcon from "@popcorn/app/components/SVGIcons/RightArrowIcon";
import { setMultiChoiceActionModal } from "@popcorn/components/context/actions";
import { store } from "@popcorn/components/context/store";
import { BigNumber, constants, ethers } from "ethers";
import { isDepositDisabled } from "@popcorn/app/helper/isDepositDisabled";
import { ModalType, toggleModal } from "@popcorn/app/helper/modalHelpers";
import useButterBatch from "@popcorn/app/hooks/set/useButterBatch";
import useButterBatchData from "@popcorn/app/hooks/set/useButterBatchData";
import useButterBatchZapper from "@popcorn/app/hooks/set/useButterBatchZapper";
import useButterWhaleData from "@popcorn/app/hooks/set/useButterWhaleData";
import useButterWhaleProcessing from "@popcorn/app/hooks/set/useButterWhaleProcessing";
import useThreeCurveVirtualPrice from "@popcorn/app/hooks/useThreeCurveVirtualPrice";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { ConnectWallet } from "@popcorn/components/components/ConnectWallet";
import SetStats from "@popcorn/app/components/SetStats";
import { useAdjustDepositDecimals } from "@popcorn/app/hooks/useAdjustDepositDecimals";
import { useChainIdFromUrl } from "@popcorn/app/hooks/useChainIdFromUrl";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import { useTransaction } from "@popcorn/app/hooks/useTransaction";
import { useRouter } from "next/router";
import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import ContentLoader from "react-content-loader";
import { SwitchNetwork } from "@popcorn/app/components/SwitchNetwork";
import { useAccount } from "wagmi";
import { useButterIsSupportedOnNetwork } from "@popcorn/app/hooks/useButterIsSupportedOnNetwork";
import { useIsConnected } from "@popcorn/app/hooks/useIsConnected";

export enum TOKEN_INDEX {
  dai,
  usdc,
  usdt,
}

export function getZapDepositAmount(depositAmount: BigNumber, token: Token): [BigNumber, BigNumber, BigNumber] {
  switch (token.symbol) {
    case "DAI":
      console.log(token.symbol);
      return [depositAmount, constants.Zero, constants.Zero];
    case "USDC":
      return [constants.Zero, depositAmount, constants.Zero];
    case "USDT":
      return [constants.Zero, constants.Zero, depositAmount];
  }
}

export interface ButterPageState {
  selectedToken: SelectedToken;
  useZap: boolean;
  depositAmount: BigNumber;
  redeeming: boolean;
  useUnclaimedDeposits: boolean;
  slippage: number;
  initalLoad: boolean;
  tokens: Token[];
  instant: boolean;
  isThreeX: boolean;
}

export const DEFAULT_BUTTER_PAGE_STATE: ButterPageState = {
  selectedToken: null,
  useZap: false,
  depositAmount: constants.Zero,
  redeeming: false,
  useUnclaimedDeposits: false,
  slippage: 1, // in percent (1 = 100 BPS)
  initalLoad: true,
  tokens: null,
  instant: false,
  isThreeX: false,
};

export default function ButterPage(): JSX.Element {
  const { signerOrProvider, signer } = useWeb3();
  const account = useAccount();
  const chainId = useChainIdFromUrl();
  const isConnected = useIsConnected();

  const addr = useDeployment(chainId);
  const { dispatch } = useContext(store);
  const butterBatchZapper = useButterBatchZapper(addr.butterBatchZapper, chainId);
  const butterBatch = useButterBatch(addr.butterBatch, chainId);
  const butterWhaleProcessing = useButterWhaleProcessing(addr.butterWhaleProcessing, chainId);
  const adjustDepositDecimals = useAdjustDepositDecimals(chainId);

  const {
    data: butterWhaleData,
    error: butterWhaleError,
    mutate: refetchButterWhaleData,
  } = useButterWhaleData(chainId);
  const {
    data: butterBatchData,
    error: errorFetchingButterBatchData,
    mutate: refetchButterBatchData,
  } = useButterBatchData(chainId);
  const router = useRouter();
  const [butterPageState, setButterPageState] = useState<ButterPageState>(DEFAULT_BUTTER_PAGE_STATE);
  const virtualPrice = useThreeCurveVirtualPrice(addr.threePool);
  const loadingButterBatchData = !butterPageState.selectedToken?.input || !butterPageState.selectedToken?.output;
  const [showMobileTutorial, toggleMobileTutorial] = useState<boolean>(false);
  const transaction = useTransaction(chainId);

  const butterIsSupportedOnNetwork = useButterIsSupportedOnNetwork();

  const threeCrv = useMemo(
    () =>
      (butterPageState.instant ? butterWhaleData : butterBatchData)?.tokens?.find(
        (token) => token.address === addr.threeCrv,
      ),
    [butterPageState, butterBatchData, butterWhaleData],
  );
  const butter = useMemo(
    () =>
      (butterPageState.instant ? butterWhaleData : butterBatchData)?.tokens?.find(
        (token) => token.address === addr.butter,
      ),
    [butterPageState, butterBatchData, butterWhaleData],
  );
  useEffect(() => {
    if (!signerOrProvider || !chainId) {
      return;
    }
  }, [signerOrProvider, account.address, chainId]);

  useEffect(() => {
    if (!butterBatchData || !butterBatchData?.tokens || !butterWhaleData || !butterWhaleData?.tokens) {
      return;
    }
    if (butterPageState.initalLoad) {
      setButterPageState({
        ...butterPageState,
        selectedToken: {
          input: threeCrv,
          output: butter,
        },
        tokens: butterBatchData?.tokens,
        redeeming: false,
        initalLoad: false,
      });
    } else {
      setButterPageState((prevState) => ({
        ...prevState,
        selectedToken: {
          input: (prevState.instant ? butterWhaleData?.tokens : butterBatchData?.tokens).find(
            (token) => token.address === prevState.selectedToken.input.address,
          ),
          output: (prevState.instant ? butterWhaleData?.tokens : butterBatchData?.tokens).find(
            (token) => token.address === prevState.selectedToken.output.address,
          ),
        },
        tokens: prevState.instant ? butterWhaleData?.tokens : butterBatchData?.tokens,
      }));
    }
  }, [butterBatchData, butterWhaleData]);

  useEffect(() => {
    function selectOutputToken(state: ButterPageState): Token {
      if (state.instant) {
        return butterWhaleData?.tokens?.find((token) => token.address === state.selectedToken.output.address);
      } else {
        if (state.redeeming) {
          return threeCrv;
        } else {
          return butter;
        }
      }
    }

    setButterPageState((prevState) => ({
      ...prevState,
      selectedToken: {
        input: (prevState.instant ? butterWhaleData?.tokens : butterBatchData?.tokens)?.find(
          (token) => token.address === prevState.selectedToken.input.address,
        ),
        output: selectOutputToken(prevState),
      },
      tokens: prevState.instant ? butterWhaleData?.tokens : butterBatchData?.tokens,
    }));
  }, [butterPageState.instant]);

  useEffect(() => {
    if (!butterBatchData || !butterBatchData?.tokens) {
      return;
    }
    if (butterPageState.redeeming) {
      setButterPageState({
        ...butterPageState,
        selectedToken: {
          input: butter,
          output: threeCrv,
        },
        useZap: false,
        depositAmount: constants.Zero,
        useUnclaimedDeposits: false,
      });
    } else {
      setButterPageState({
        ...butterPageState,
        selectedToken: {
          input: threeCrv,
          output: butter,
        },
        useZap: false,
        depositAmount: constants.Zero,
        useUnclaimedDeposits: false,
      });
    }
  }, [butterPageState.redeeming]);

  const hasClaimableBalances = () => {
    if (butterPageState.redeeming) {
      return butterBatchData?.claimableMintBatches.length > 0;
    }
    return butterBatchData?.claimableRedeemBatches.length > 0;
  };

  function selectToken(token: Token): void {
    const zapToken = [addr.dai, addr.usdc, addr.usdt];
    const newSelectedToken = { ...butterPageState.selectedToken };
    if (butterPageState.redeeming) {
      newSelectedToken.output = token;
    } else {
      newSelectedToken.input = token;
    }
    if (zapToken.includes(newSelectedToken.output.address) || zapToken.includes(newSelectedToken.input.address)) {
      setButterPageState({
        ...butterPageState,
        selectedToken: newSelectedToken,
        useUnclaimedDeposits: false,
        useZap: true,
        depositAmount: constants.Zero,
      });
    } else {
      setButterPageState({
        ...butterPageState,
        selectedToken: newSelectedToken,
        useUnclaimedDeposits: false,
        useZap: false,
        depositAmount: constants.Zero,
      });
    }
  }

  function handleMintSuccess() {
    setButterPageState({ ...butterPageState, depositAmount: constants.Zero });
    toggleModal(
      ModalType.MultiChoice,
      {
        title: "Deposit for Mint",
        content:
          "You have successfully deposited into the current mint batch. Check the table at the bottom of this page to claim the tokens when they are ready.",
        image: <img src="/images/modalImages/mint.svg" />,
        onConfirm: {
          label: "Continue",
          onClick: () => dispatch(setMultiChoiceActionModal(false)),
        },
        onDismiss: {
          onClick: () => {
            dispatch(setMultiChoiceActionModal(false));
          },
        },
        onDontShowAgain: {
          label: "Do not remind me again",
          onClick: () => {
            localStorage.setItem("hideBatchProcessingPopover", "true");
            dispatch(setMultiChoiceActionModal(false));
          },
        },
      },
      "hideMintPopover",
      dispatch,
    );
  }

  function handleRedeemSuccess() {
    setButterPageState({ ...butterPageState, depositAmount: constants.Zero });
    toggleModal(
      ModalType.MultiChoice,
      {
        title: "Deposit for Redeem",
        content:
          "You have successfully deposited into the current redeem batch. Check the table at the bottom of this page to claim the tokens when they are ready.",
        image: <img src="/images/modalImages/mint.svg" />,
        onConfirm: {
          label: "Continue",
          onClick: () => dispatch(setMultiChoiceActionModal(false)),
        },
        onDismiss: {
          onClick: () => {
            dispatch(setMultiChoiceActionModal(false));
          },
        },
        onDontShowAgain: {
          label: "Do not remind me again",
          onClick: () => {
            localStorage.setItem("hideBatchProcessingPopover", "true");
            dispatch(setMultiChoiceActionModal(false));
          },
        },
      },
      "hideRedeemPopover",
      dispatch,
    );
  }

  async function instantMint(depositAmount: BigNumber, stakeImmidiate = false): Promise<ethers.ContractTransaction> {
    if (butterPageState.useZap) {
      const virtualPriceValue = await virtualPrice();
      console.log(virtualPriceValue.toString());
      const min3CrvAmount = getMinZapAmount(
        depositAmount,
        butterPageState.slippage,
        virtualPriceValue,
        await butterPageState.selectedToken.input.contract.decimals(),
      );
      return butterWhaleProcessing
        .connect(signer)
        .zapMint(
          getZapDepositAmount(depositAmount, butterPageState.selectedToken.input),
          min3CrvAmount,
          percentageToBps(butterPageState.slippage),
          stakeImmidiate,
        );
    }
    return butterWhaleProcessing
      .connect(signer)
      .mint(depositAmount, percentageToBps(butterPageState.slippage), stakeImmidiate);
  }
  async function instantRedeem(depositAmount: BigNumber): Promise<ethers.ContractTransaction> {
    if (butterPageState.useZap) {
      return butterWhaleProcessing
        .connect(signer)
        .zapRedeem(
          depositAmount,
          getIndexForToken(butterPageState.selectedToken.output),
          (await adjustDepositDecimals(depositAmount, butterPageState.selectedToken.output))
            .mul(100 - butterPageState.slippage)
            .div(100),
          butterPageState.slippage,
        );
    }
    return butterWhaleProcessing.connect(signer).redeem(depositAmount, percentageToBps(butterPageState.slippage));
  }
  async function batchMint(depositAmount: BigNumber): Promise<ethers.ContractTransaction> {
    if (butterPageState.useZap) {
      const virtualPriceValue = await virtualPrice();
      console.log(depositAmount.toString());
      console.log(virtualPriceValue.toString());
      const minMintAmount = getMinZapAmount(
        depositAmount,
        butterPageState.slippage,
        virtualPriceValue,
        await butterPageState.selectedToken.input.contract.decimals(),
      );
      return butterBatchZapper
        .connect(signer)
        .zapIntoBatch(getZapDepositAmount(depositAmount, butterPageState.selectedToken.input), minMintAmount);
    }
    return butterBatch.connect(signer).depositForMint(depositAmount, account.address);
  }

  async function batchRedeem(depositAmount: BigNumber): Promise<ethers.ContractTransaction> {
    return butterBatch.connect(signer).depositForRedeem(depositAmount);
  }
  async function hotswapRedeem(depositAmount: BigNumber): Promise<ethers.ContractTransaction> {
    const batches = butterBatchData?.claimableMintBatches;
    const hotSwapParameter = prepareHotSwap(batches, depositAmount);
    return butterBatch
      .connect(signer)
      .moveUnclaimedDepositsIntoCurrentBatch(
        hotSwapParameter.batchIds as string[],
        hotSwapParameter.amounts,
        BatchType.Mint,
      );
  }
  async function hotswapMint(depositAmount: BigNumber): Promise<ethers.ContractTransaction> {
    const batches = butterBatchData?.claimableRedeemBatches;
    const hotSwapParameter = prepareHotSwap(batches, depositAmount);
    return butterBatch
      .connect(signer)
      .moveUnclaimedDepositsIntoCurrentBatch(
        hotSwapParameter.batchIds as string[],
        hotSwapParameter.amounts,
        BatchType.Redeem,
      );
  }

  async function handleMainAction(
    depositAmount: BigNumber,
    batchType: BatchType,
    stakeImmidiate = false,
  ): Promise<void> {
    depositAmount = await adjustDepositDecimals(depositAmount, butterPageState.selectedToken.input);
    if (butterPageState.instant && butterPageState.redeeming) {
      transaction(
        () => instantRedeem(depositAmount),
        "Withdrawing Butter...",
        "Butter Withdrawn!",
        () => setButterPageState({ ...butterPageState, depositAmount: constants.Zero }),
      );
    } else if (butterPageState.instant) {
      transaction(
        () => instantMint(depositAmount),
        "Minting Butter...",
        "Butter minted!",
        () => setButterPageState({ ...butterPageState, depositAmount: constants.Zero }),
      );
    } else if (butterPageState.useUnclaimedDeposits && batchType === BatchType.Mint) {
      transaction(
        () => hotswapMint(depositAmount),
        "Depositing Funds...",
        "Funds deposited!",
        () => setButterPageState({ ...butterPageState, depositAmount: constants.Zero }),
      );
    } else if (butterPageState.useUnclaimedDeposits) {
      transaction(
        () => hotswapRedeem(depositAmount),
        "Depositing Funds...",
        "Funds deposited!",
        () => setButterPageState({ ...butterPageState, depositAmount: constants.Zero }),
      );
    } else if (batchType === BatchType.Mint) {
      transaction(
        () => batchMint(depositAmount),
        `Depositing ${butterPageState.selectedToken.input.symbol}...`,
        `${butterPageState.selectedToken.input.symbol} deposited!`,
        handleMintSuccess,
      );
    } else {
      transaction(() => batchRedeem(depositAmount), "Depositing Butter...", "Butter deposited!", handleRedeemSuccess);
    }
    await Promise.all([refetchButterBatchData(), refetchButterWhaleData()]);
  }

  function handleClaimSuccess() {
    refetchButterBatchData();
    toggleModal(
      ModalType.MultiChoice,
      {
        title: "You claimed your token",
        children: (
          <>
            <p className="text-base text-primaryDark mb-4">
              Your tokens are now in your wallet. To see them make sure to import butter into your wallet
            </p>
            <p>
              <a
                onClick={async () =>
                  window.ethereum.request({
                    // @ts-ignore
                    method: "wallet_watchAsset",
                    params: {
                      // @ts-ignore
                      type: "ERC20",
                      options: {
                        address: addr.butter,
                        symbol: "BTR",
                        decimals: 18,
                      },
                    },
                  })
                }
                className="text-customPurple cursor-pointer"
              >
                Add BTR to Wallet
              </a>
            </p>
          </>
        ),
        image: <img src="/images/modalImages/redeemed.svg" />,
        onConfirm: {
          label: "Continue",
          onClick: () => dispatch(setMultiChoiceActionModal(false)),
        },
        onDismiss: {
          onClick: () => {
            dispatch(setMultiChoiceActionModal(false));
          },
        },
        onDontShowAgain: {
          label: "Do not remind me again",
          onClick: () => {
            localStorage.setItem("hideClaimSuccessPopover", "true");
            dispatch(setMultiChoiceActionModal(false));
          },
        },
      },
      "hideClaimSuccessPopover",
      dispatch,
    );
  }

  async function claim(batchId: string, useZap?: boolean, outputToken?: Token): Promise<void> {
    transaction(
      async () => {
        let call;
        if (useZap) {
          call = async () =>
            butterBatchZapper.connect(signer).claimAndSwapToStable(
              batchId,
              getIndexForToken(outputToken),
              (
                await adjustDepositDecimals(
                  butterBatchData?.accountBatches
                    .find((batch) => batch.batchId === batchId)
                    .accountClaimableTokenBalance.mul(threeCrv.price)
                    .div(outputToken.price),
                  outputToken,
                )
              )
                .mul(100 - butterPageState.slippage)
                .div(100),
            );
        } else {
          call = async () => butterBatch.connect(signer).claim(batchId, account.address);
        }
        return call();
      },
      "Claiming ...",
      "Tokens claimed!",
      handleClaimSuccess,
    );
  }

  async function claimAndStake(batchId: string): Promise<void> {
    transaction(
      () => butterBatch.connect(signer).claimAndStake(batchId, account.address),
      "Claiming and staking Butter...",
      "Staked claimed Butter",
      refetchButterBatchData,
    );
  }

  async function withdraw(batchId: string, amount: BigNumber, useZap?: boolean, outputToken?: Token): Promise<void> {
    transaction(
      async () => {
        let call;
        if (useZap) {
          call = async () =>
            butterBatchZapper
              .connect(signer)
              .zapOutOfBatch(
                batchId,
                amount,
                getIndexForToken(outputToken),
                (await adjustDepositDecimals(amount, outputToken)).mul(100 - butterPageState.slippage).div(100),
              );
        } else {
          call = async () => butterBatch.connect(signer).withdrawFromBatch(batchId, amount, account.address);
        }
        return call();
      },
      "Withdrawing funds...",
      "Funds withdrawn!",
      refetchButterBatchData,
    );
  }

  function getCurrentContractAddress(): string {
    if (butterPageState.instant) {
      return butterWhaleProcessing.address;
    }
    if (butterPageState.useZap) {
      return butterBatchZapper.address;
    }
    return butterBatch.address;
  }

  async function approve(token: Token): Promise<void> {
    transaction(
      () => token.contract.connect(signer).approve(getCurrentContractAddress(), ethers.constants.MaxUint256),
      "Approving ...",
      `Token approved!`,
      () => refetchButterBatchData(),
    );
  }

  function getBatchProgressAmount(): BigNumber {
    if (!butterBatchData) {
      return constants.Zero;
    }
    return butterPageState.redeeming
      ? butterBatchData?.currentBatches.redeem.suppliedTokenBalance.mul(butter.price).div(parseEther("1"))
      : butterBatchData?.currentBatches.mint.suppliedTokenBalance.mul(threeCrv.price).div(parseEther("1"));
  }

  return (
    <>
      <div className="grid grid-cols-12">
        <div className="col-span-12 md:col-span-7">
          <h1 className="text-6xl leading-12">
            Butter - Yield <br />
            Optimizer
          </h1>
          <p className="mt-4 leading-5 text-primaryDark">
            Mint BTR and earn interest on multiple stablecoins at once. <br />
            Stake BTR to earn boosted APY.
          </p>
          <SetStats address={addr.butter} chainId={chainId} stakingAddress={addr.butterStaking} symbol={"BTR"} />
        </div>
        <div className="col-span-5 hidden md:block">
          <TutorialSlider isThreeX={false} />
        </div>
      </div>
      <div className="md:hidden my-10">
        <div
          className="bg-customPurple rounded-lg w-full px-6 py-6 text-white flex justify-between items-center"
          role="button"
          onClick={() => toggleMobileTutorial(true)}
        >
          <p className="text-medium leading-4">Learn How It Works</p>
          <RightArrowIcon color="fff" />
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:mt-10">
        <div className="md:w-1/3 mb-10">
          <div className="order-2 md:order-1">
            {/* Connected and on Ethereum BUT loading */}
            <div className={!!isConnected && butterIsSupportedOnNetwork && loadingButterBatchData ? "" : "hidden"}>
              <div className="order-2 md:hidden">
                <ContentLoader viewBox="0 0 450 600" backgroundColor={"#EBE7D4"} foregroundColor={"#d7d5bc"}>
                  <rect x="0" y="0" rx="8" ry="8" width="100%" height="600" />
                </ContentLoader>
              </div>
              <div className="order-1 hidden md:block">
                <ContentLoader viewBox="0 0 450 600" backgroundColor={"#EBE7D4"} foregroundColor={"#d7d5bc"}>
                  <rect x="0" y="0" rx="8" ry="8" width="90%" height="600" />
                </ContentLoader>
              </div>
            </div>
            {/* Connected and on Ethereum all data loaded */}
            {account.address &&
              butterIsSupportedOnNetwork &&
              !loadingButterBatchData &&
              butterBatchData &&
              butterPageState.selectedToken && (
                <div className="md:pr-8">
                  <MintRedeemInterface
                    chainId={chainId}
                    approve={approve}
                    mainAction={handleMainAction}
                    options={butterPageState.tokens}
                    selectedToken={butterPageState.selectedToken}
                    selectToken={selectToken}
                    page={Pages.butter}
                    instant={butterPageState.instant}
                    setInstant={(val) => setButterPageState((prevState) => ({ ...prevState, instant: val }))}
                    depositAmount={butterPageState.depositAmount}
                    setDepositAmount={(val) =>
                      setButterPageState((prevState) => ({ ...prevState, depositAmount: val }))
                    }
                    depositDisabled={isDepositDisabled(
                      butterWhaleData.totalSupply,
                      butter,
                      butterPageState.selectedToken,
                      butterPageState.redeeming,
                      butterPageState.depositAmount,
                      butterPageState.useUnclaimedDeposits,
                    )}
                    withdrawMode={butterPageState.redeeming}
                    setWithdrawMode={(val) => {
                      setButterPageState((prevState) => ({ ...prevState, redeeming: val }));
                    }}
                    showSlippageAdjust={butterPageState.instant || butterPageState.useZap}
                    slippage={butterPageState.slippage}
                    setSlippage={(val) => setButterPageState((prevState) => ({ ...prevState, slippage: val }))}
                    hasUnclaimedBalances={hasClaimableBalances()}
                    useUnclaimedDeposits={butterPageState.useUnclaimedDeposits}
                    setUseUnclaimedDeposits={(val) =>
                      setButterPageState((prevState) => ({ ...prevState, useUnclaimedDeposits: val }))
                    }
                  />
                </div>
              )}
            <SwitchNetwork chainId={ChainId.Ethereum} hidden={!isConnected || butterIsSupportedOnNetwork} />
            <div className={`order-2 md:order-1 ${!!isConnected ? "hidden" : ""} md:mr-8`}>
              <ConnectWallet hidden={!!isConnected} />
            </div>
          </div>
        </div>

        <div className="order-1 md:order-2 md:w-2/3 flex flex-col">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 md:mr-2 mb-4 md:mb-0">
              <StatInfoCard
                title="Butter Value"
                content={`$${butter ? formatAndRoundBigNumber(butter?.price, butter?.decimals) : "-"}`}
                icon={"Butter"}
                info={{
                  title: "Underlying Tokens",
                  content: (
                    <span>
                      <br />
                      25.00% yvCurve-FRAX <br />
                      25.00% yvCurve-RAI <br />
                      25.00% yvCurve-mUSD <br />
                      25.00% yvCurve-alUSD <br />
                      <br />
                      BTR has Exposure to: FRAX, RAI, mUSD, alUSD, sUSD and 3CRV (USDC/DAI/USDT).
                    </span>
                  ),
                }}
              />
            </div>
            <div className="md:w-1/2 md:ml-2 mb-8 md:mb-0">
              <BatchProgress batchAmount={getBatchProgressAmount()} threshold={parseEther("100000")} />
            </div>
          </div>
          <div className="w-full pb-12 mx-auto mt-10">
            <div className="md:overflow-x-hidden md:max-h-108">
              <ClaimableBatches
                options={[
                  threeCrv,
                  butterBatchData?.tokens?.find((token) => token.address === addr.dai),
                  butterBatchData?.tokens?.find((token) => token.address === addr.usdc),
                  butterBatchData?.tokens?.find((token) => token.address === addr.usdt),
                ]}
                slippage={butterPageState.slippage}
                setSlippage={(val) => setButterPageState((prevState) => ({ ...prevState, slippage: val }))}
                batches={butterBatchData?.accountBatches}
                claim={claim}
                claimAndStake={claimAndStake}
                withdraw={withdraw}
              />
            </div>
          </div>
        </div>
      </div>
      {/* <FooterLandScapeImage/> */}
      <Transition.Root show={showMobileTutorial} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 overflow-hidden z-40" onClose={() => toggleMobileTutorial(false)}>
          <Dialog.Overlay className="absolute inset-0 overflow-hidden">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="w-screen">
                <MobileTutorialSlider isThreeX onCloseMenu={() => toggleMobileTutorial(false)} />
              </div>
            </Transition.Child>
          </Dialog.Overlay>
        </Dialog>
      </Transition.Root>
    </>
  );
}
