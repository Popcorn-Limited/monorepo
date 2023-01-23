import { parseEther } from "@ethersproject/units";
import { Dialog, Transition } from "@headlessui/react";
import { ThreeXWhaleProcessing } from "@popcorn/hardhat/typechain";
import { ChainId, getIndexForToken, getMinZapAmount, prepareHotSwap } from "@popcorn/utils";
import { BatchType, Token } from "@popcorn/utils/src/types";
import BatchProgress from "@popcorn/app/components/BatchButter/BatchProgress";
import { Pages } from "@popcorn/app/components/BatchButter/ButterTokenInput";
import ClaimableBatches from "@popcorn/app/components/BatchButter/ClaimableBatches";
import MintRedeemInterface from "@popcorn/app/components/BatchButter/MintRedeemInterface";
import MobileTutorialSlider from "@popcorn/app/components/BatchButter/MobileTutorialSlider";
import StatInfoCard from "@popcorn/app/components/BatchButter/StatInfoCard";
import { ConnectWallet } from "@popcorn/components/components/ConnectWallet";
import SetStats from "@popcorn/app/components/SetStats";
import RightArrowIcon from "@popcorn/app/components/SVGIcons/RightArrowIcon";
import { SwitchNetwork } from "@popcorn/app/components/SwitchNetwork";
import { setMultiChoiceActionModal } from "@popcorn/components/context/actions";
import { store } from "@popcorn/components/context/store";
import { BigNumber, constants, ethers } from "ethers";
import { ModalType, toggleModal } from "@popcorn/app/helper/modalHelpers";
import useSetToken from "@popcorn/app/hooks/set/useSetToken";
import useThreeXBatch from "@popcorn/app/hooks/set/useThreeXBatch";
import useThreeXData from "@popcorn/app/hooks/set/useThreeXData";
import useThreeXWhale from "@popcorn/app/hooks/set/useThreeXWhale";
import useThreeXWhaleData from "@popcorn/app/hooks/set/useThreeXWhaleData";
import useThreeXZapper from "@popcorn/app/hooks/set/useThreeXZapper";
import { useAdjustDepositDecimals } from "@popcorn/app/hooks/useAdjustDepositDecimals";
import { useChainIdFromUrl } from "@popcorn/app/hooks/useChainIdFromUrl";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import { useTransaction } from "@popcorn/app/hooks/useTransaction";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react";
import ContentLoader from "react-content-loader";
import { isDepositDisabled } from "@popcorn/app/helper/isDepositDisabled";
import { ButterPageState, DEFAULT_BUTTER_PAGE_STATE } from "@popcorn/app/pages/[network]/set/butter";
import { useIsConnected } from "@popcorn/app/hooks/useIsConnected";
import { useButterIsSupportedOnNetwork } from "@popcorn/app/hooks/useButterIsSupportedOnNetwork";
import { Price } from "@popcorn/components";

export default function ThreeXPage(): JSX.Element {
  const { signer, account } = useWeb3();
  const chainId = useChainIdFromUrl();
  const contractAddresses = useDeployment(chainId);

  const { dispatch } = useContext(store);
  const threeXSetToken = useSetToken(contractAddresses.threeX, chainId);
  const threeXZapper = useThreeXZapper(contractAddresses.threeXZapper, chainId);
  const threeXBatch = useThreeXBatch(contractAddresses.threeXBatch, chainId);
  const threeXWhale = useThreeXWhale(contractAddresses.threeXWhale, chainId);
  const ZAP_TOKEN = [contractAddresses.dai, contractAddresses.usdt];
  const { data: threeXData, error: errorFetchingThreeXData, mutate: refetchThreeXBatchData } = useThreeXData(chainId);
  const {
    data: threeXWhaleData,
    error: errorFetchingThreeXWhaleData,
    mutate: refetchThreeXWhaleData,
  } = useThreeXWhaleData(chainId);
  const [threeXPageState, setThreeXPageState] = useState<ButterPageState>(DEFAULT_BUTTER_PAGE_STATE);
  const loadingThreeXData = !threeXData && !errorFetchingThreeXData;
  const [showMobileTutorial, toggleMobileTutorial] = useState<boolean>(false);
  const isConnected = useIsConnected();

  const transaction = useTransaction(chainId);
  const adjustDepositDecimals = useAdjustDepositDecimals(chainId);
  const refetchThreeXData = () => Promise.all([refetchThreeXBatchData(), refetchThreeXWhaleData()]);

  const butterIsSupportedOnNetwork = useButterIsSupportedOnNetwork();

  const threeX = useMemo(
    () =>
      (threeXPageState.instant ? threeXWhaleData : threeXData)?.tokens?.find(
        (token) => token.address === contractAddresses.threeX,
      ),
    [threeXPageState, threeXWhaleData, threeXData],
  );

  const usdc = useMemo(
    () =>
      (threeXPageState.instant ? threeXWhaleData : threeXData)?.tokens?.find(
        (token) => token.address === contractAddresses.usdc,
      ),
    [threeXPageState, threeXWhaleData, threeXData],
  );

  useEffect(() => {
    if (!threeXData || !threeXData?.tokens) {
      return;
    }
    setThreeXPageState((state) =>
      state.initalLoad
        ? {
            ...state,
            selectedToken: {
              input: usdc,
              output: threeX,
            },
            tokens: threeXData?.tokens,
            redeeming: false,
            initalLoad: false,
            isThreeX: true,
          }
        : {
            ...state,
            selectedToken: {
              input: (state.instant ? threeXWhaleData?.tokens : threeXData?.tokens).find(
                (token) => token.address === state.selectedToken.input.address,
              ),
              output: (state.instant ? threeXWhaleData?.tokens : threeXData?.tokens).find(
                (token) => token.address === state.selectedToken.output.address,
              ),
            },
            tokens: state.instant ? threeXWhaleData?.tokens : threeXData?.tokens,
          },
    );
  }, [threeXData, threeXWhaleData]);

  useEffect(() => {
    function selectOutputToken(state: ButterPageState): Token {
      if (state.instant) {
        return threeXWhaleData?.tokens?.find((token) => token.address === state.selectedToken.output.address);
      } else {
        if (state.redeeming) {
          return usdc;
        } else {
          return threeX;
        }
      }
    }

    setThreeXPageState((state) => ({
      ...state,
      selectedToken: {
        input: (state.instant ? threeXWhaleData?.tokens : threeXData?.tokens)?.find(
          (token) => token.address === state.selectedToken.input.address,
        ),
        output: selectOutputToken(state),
      },
      tokens: state.instant ? threeXWhaleData?.tokens : threeXData?.tokens,
    }));
  }, [threeXPageState.instant]);

  useEffect(() => {
    if (!threeXData || !threeXData?.tokens) {
      return;
    }
    setThreeXPageState((state) => ({
      ...state,
      selectedToken: {
        input: state.redeeming ? threeX : usdc,
        output: state.redeeming ? usdc : threeX,
      },
      useZap: false,
      depositAmount: constants.Zero,
      useUnclaimedDeposits: false,
    }));
  }, [threeXPageState.redeeming]);

  const hasClaimableBalances = () => {
    if (threeXPageState.redeeming) {
      return threeXData?.claimableMintBatches.length > 0;
    }
    return threeXData?.claimableRedeemBatches.length > 0;
  };

  function selectToken(token: Token): void {
    setThreeXPageState((state) => ({
      ...state,
      selectedToken: {
        input: state.redeeming ? state.selectedToken.input : token,
        output: state.redeeming ? token : state.selectedToken.output,
      },
      useUnclaimedDeposits: false,
      useZap: ZAP_TOKEN.includes(token.address),
      depositAmount: BigNumber.from("0"),
    }));
  }

  async function handleMainAction(depositAmount: BigNumber, batchType: BatchType, stakeImmidiate = false) {
    // Lower depositAmount decimals to 1e6 if the inputToken is USDC/USDT
    depositAmount = await adjustDepositDecimals(depositAmount, threeXPageState.selectedToken.input);

    if (threeXPageState.instant && threeXPageState.redeeming) {
      transaction(
        () => instantRedeem(threeXWhale, depositAmount, threeXPageState, signer),
        "Redeeming 3X ...",
        "3X Redeemed!",
      );
    } else if (threeXPageState.instant) {
      transaction(
        () => instantMint(threeXWhale, depositAmount, threeXPageState, threeX.price, stakeImmidiate, signer),
        "Minting 3X ...",
        "3X Minted!",
      );
    } else if (threeXPageState.useUnclaimedDeposits && batchType === BatchType.Mint) {
      transaction(() => hotswapMint(depositAmount), "Depositing Funds...", "Funds deposited!");
    } else if (threeXPageState.useUnclaimedDeposits) {
      await transaction(() => hotswapRedeem(depositAmount), "Depositing Funds...", `Funds deposited!`);
    } else if (batchType === BatchType.Mint) {
      await transaction(
        () => batchMint(depositAmount),
        `Depositing ${threeXPageState.selectedToken.input.symbol} ...`,
        `${threeXPageState.selectedToken.input.symbol} deposited!`,
        handleMintSuccess,
      );
    } else {
      await transaction(
        () => batchRedeem(depositAmount),
        "Depositing 3X for redemption ...",
        `3X deposited!`,
        handleRedeemSuccess,
      );
    }
    await refetchThreeXData();
    setThreeXPageState((state) => ({ ...state, depositAmount: constants.Zero }));
  }

  async function hotswapRedeem(depositAmount: BigNumber): Promise<ethers.ContractTransaction> {
    const batches = threeXData?.claimableMintBatches;
    const hotSwapParameter = prepareHotSwap(batches, depositAmount);
    return threeXBatch
      .connect(signer)
      .moveUnclaimedIntoCurrentBatch(hotSwapParameter.batchIds, hotSwapParameter.amounts, false);
  }
  async function hotswapMint(depositAmount: BigNumber): Promise<ethers.ContractTransaction> {
    const batches = threeXData?.claimableRedeemBatches;
    const hotSwapParameter = prepareHotSwap(batches, depositAmount);
    return threeXBatch
      .connect(signer)
      .moveUnclaimedIntoCurrentBatch(hotSwapParameter.batchIds, hotSwapParameter.amounts, true);
  }

  async function batchMint(depositAmount: BigNumber): Promise<ethers.ContractTransaction> {
    if (threeXPageState.useZap) {
      const minUsdcAmount = getMinZapAmount(
        depositAmount,
        threeXPageState.slippage,
        parseEther("1"),
        threeXPageState.selectedToken.input.address === contractAddresses.dai ? 18 : 6,
        6,
      );

      return threeXZapper
        .connect(signer)
        .zapIntoBatch(
          depositAmount,
          getIndexForToken(threeXPageState.selectedToken.input),
          getIndexForToken(usdc),
          minUsdcAmount,
        );
    }
    return threeXBatch.connect(signer).depositForMint(depositAmount, account);
  }
  async function batchRedeem(depositAmount: BigNumber): Promise<ethers.ContractTransaction> {
    return threeXBatch.connect(signer).depositForRedeem(depositAmount);
  }
  function handleMintSuccess() {
    return toggleModal(
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
        onDontShowAgain: {
          label: "Do not remind me again",
          onClick: () => {
            localStorage.setItem("hideBatchProcessingPopover", "true");
            dispatch(setMultiChoiceActionModal(false));
          },
        },
        onDismiss: {
          onClick: () => {
            dispatch(setMultiChoiceActionModal(false));
          },
        },
      },
      "hideMintPopover",
      dispatch,
    );
  }
  function handleRedeemSuccess() {
    return toggleModal(
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

  async function claim(batchId: string, useZap?: boolean, outputToken?: Token): Promise<void> {
    transaction(
      async () => {
        let call;
        if (useZap) {
          call = async () =>
            threeXZapper.connect(signer).claimAndSwapToStable(
              batchId,
              getIndexForToken(usdc),
              getIndexForToken(outputToken),
              (
                await adjustDepositDecimals(
                  threeXData?.accountBatches
                    .find((batch) => batch.batchId === batchId)
                    .accountClaimableTokenBalance.mul(usdc.price)
                    .div(outputToken.price),
                  outputToken,
                )
              )
                .mul(100 - threeXPageState.slippage)
                .div(100),
            );
        } else {
          call = async () => threeXBatch.connect(signer).claim(batchId, account);
        }
        return call();
      },
      "Claiming ...",
      "Tokens claimed!",
      () => {
        refetchThreeXData();
        toggleModal(
          ModalType.MultiChoice,
          {
            title: "You claimed your token",
            children: (
              <>
                <p className="text-base text-primaryDark mb-4">
                  Your tokens are now in your wallet. To see them make sure to import 3x into your wallet
                </p>
                <p>
                  <a
                    onClick={async () =>
                      await window.ethereum.request({
                        // @ts-ignore
                        method: "wallet_watchAsset",
                        params: {
                          // @ts-ignore
                          type: "ERC20",
                          options: {
                            address: threeXSetToken?.address,
                            symbol: "3X",
                            decimals: 18,
                          },
                        },
                      })
                    }
                    className="text-customPurple cursor-pointer"
                  >
                    Add 3X to Wallet
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
      },
    );
  }

  async function claimAndStake(batchId: string): Promise<ethers.ContractTransaction> {
    return transaction(
      () => threeXBatch.connect(signer).claimAndStake(batchId),
      "Claiming and staking 3X...",
      `Staked 3X!`,
      () => refetchThreeXData(),
    );
  }

  async function handleWithdraw(batchId: string, amount: BigNumber, useZap?: boolean, outputToken?: Token) {
    return transaction(
      () => withdraw(batchId, amount, useZap, outputToken),
      "Withdrawing ...",
      `Funds withdrawn!`,
      () => refetchThreeXData(),
    );
  }

  async function withdraw(batchId: string, amount: BigNumber, useZap?: boolean, outputToken?: Token) {
    if (useZap) {
      return threeXZapper
        .connect(signer)
        .zapOutOfBatch(
          batchId,
          amount,
          getIndexForToken(usdc),
          getIndexForToken(outputToken),
          (await adjustDepositDecimals(amount, outputToken)).mul(100 - threeXPageState.slippage).div(100),
        );
    } else {
      return threeXBatch.connect(signer)["withdrawFromBatch(bytes32,uint256,address)"](batchId, amount, account);
    }
  }

  function getCurrentlyActiveContract() {
    if (threeXPageState.instant) {
      return threeXWhale;
    } else if (threeXPageState.useZap) {
      return threeXZapper;
    } else {
      return threeXBatch;
    }
  }

  async function approve(token: Token): Promise<void> {
    transaction(
      () => token.contract.connect(signer).approve(getCurrentlyActiveContract().address, ethers.constants.MaxUint256),
      "Approving ...",
      `Token approved!`,
      () => refetchThreeXData(),
    );
  }

  const getBatchProgressAmount = useCallback(() => {
    if (!threeXData || !threeX?.price || !usdc?.price) {
      return BigNumber.from("0");
    }
    return threeXPageState.redeeming
      ? threeXData?.currentBatches.redeem.suppliedTokenBalance.mul(threeX?.price).div(parseEther("1"))
      : threeXData?.currentBatches.mint.suppliedTokenBalance.mul(usdc?.price).div(BigNumber.from(1_000_000));
  }, [threeX?.price, usdc?.price]);

  return (
    <>
      <div className="grid grid-cols-12">
        <div className="col-span-12 md:col-span-4">
          <h1 className="text-6xl leading-12">3X</h1>
          <p className="mt-4 leading-5 text-primaryDark">
            Mint 3X and earn interest on multiple stablecoins at once. <br />
            Stake your 3X to earn boosted APY.
          </p>
          <SetStats
            address={contractAddresses.threeX}
            chainId={ChainId.Ethereum}
            stakingAddress={contractAddresses.threeXStaking}
            symbol={"3X"}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row mt-10">
        <div className="md:w-1/3 mb-2 md:mb-10">
          {/* Connected and on Ethereum BUT loading */}
          <span className={!!isConnected && butterIsSupportedOnNetwork && loadingThreeXData ? "" : "hidden"}>
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
          </span>
          {/* Connected and on Ethereum all data loaded */}
          <div
            className={`md:pr-8 order-2 md:order-1 ${
              !!account &&
              butterIsSupportedOnNetwork &&
              !loadingThreeXData &&
              threeXData &&
              threeXPageState?.tokens &&
              threeXPageState.selectedToken
                ? ""
                : "hidden"
            }`}
          >
            <MintRedeemInterface
              mainAction={handleMainAction}
              approve={approve}
              options={threeXPageState?.tokens}
              selectedToken={threeXPageState.selectedToken}
              selectToken={selectToken}
              depositDisabled={isDepositDisabled(
                threeXData?.totalSupply,
                threeX,
                threeXPageState?.selectedToken,
                threeXPageState?.redeeming,
                threeXPageState?.depositAmount,
                threeXPageState?.useUnclaimedDeposits,
                true,
                !threeXData || loadingThreeXData || !threeXPageState,
              )}
              page={Pages.threeX}
              disabled={loadingThreeXData || !threeXData || !threeXPageState}
              instant={threeXPageState?.instant}
              setInstant={(val) => setThreeXPageState((prevState) => ({ ...prevState, instant: val }))}
              depositAmount={threeXPageState?.depositAmount}
              setDepositAmount={(val) => setThreeXPageState((prevState) => ({ ...prevState, depositAmount: val }))}
              showSlippageAdjust={threeXPageState?.instant || (threeXPageState?.redeeming && threeXPageState?.useZap)}
              slippage={threeXPageState?.slippage}
              setSlippage={(val) => setThreeXPageState((prevState) => ({ ...prevState, slippage: val }))}
              withdrawMode={threeXPageState?.redeeming}
              setWithdrawMode={(val) => setThreeXPageState((prevState) => ({ ...prevState, redeeming: val }))}
              hasUnclaimedBalances={hasClaimableBalances()}
              useUnclaimedDeposits={threeXPageState?.useUnclaimedDeposits}
              chainId={chainId}
              setUseUnclaimedDeposits={(val) =>
                setThreeXPageState((prevState) => ({ ...prevState, useUnclaimedDeposits: val }))
              }
            />
          </div>
          <SwitchNetwork chainId={ChainId.Ethereum} hidden={!isConnected || butterIsSupportedOnNetwork} />
          <div className={`order-2 md:order-1 ${!!isConnected ? "hidden" : ""} md:pr-8`}>
            <ConnectWallet hidden={!!isConnected} />
          </div>
        </div>

        <div className="order-1 md:order-2 md:w-2/3 flex flex-col">
          <div className="flex flex-col md:flex-row mb-8">
            <div className="md:w-1/2 flex flex-col mb-2 md:mr-8 order-1">
              <BatchProgress batchAmount={getBatchProgressAmount()} threshold={parseEther("100000")} />
            </div>
            <div className="md:w-1/2 flex flex-col gap-4 order-2 mb-2 ">
              <StatInfoCard
                title="3X Value"
                content={<Price.PriceOf address={contractAddresses.threeX} chainId={chainId} />}
                icon={"3X"}
                info={{
                  title: "Underlying Tokens",
                  content: (
                    <span>
                      <br />
                      50% yvCurve-sUSDpool <br />
                      50% yvCurve-3EURpool <br />
                      <br />
                      3X has Exposure to: sUSD, DAI, USDC, USDT, agEUR, EURT and EURS.
                    </span>
                  ),
                }}
              />
            </div>
          </div>
          <div className="w-full md:block -order-1 md:order-1 mb-4">
            <div
              className="bg-warmGray rounded-lg w-full px-4 py-6 text-black flex justify-between items-center"
              role="button"
              onClick={() => toggleMobileTutorial(true)}
            >
              <p className="text-medium">Learn How It Works</p>
              <RightArrowIcon color="000" />
            </div>
          </div>
          <div className="w-full pb-12 mx-auto mt-10 md:order-2">
            <div className="md:overflow-x-hidden md:max-h-108">
              <ClaimableBatches
                options={[
                  usdc,
                  threeXPageState?.tokens?.find((token) => token.address === contractAddresses.dai),
                  threeXPageState?.tokens?.find((token) => token.address === contractAddresses.usdt),
                ]}
                slippage={threeXPageState.slippage}
                setSlippage={(val) => setThreeXPageState((prevState) => ({ ...prevState, slippage: val }))}
                batches={threeXData?.accountBatches}
                claim={claim}
                claimAndStake={claimAndStake}
                withdraw={handleWithdraw}
                isThreeX
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
export async function instantMint(
  threeXWhale: ThreeXWhaleProcessing,
  depositAmount: BigNumber,
  threeXPageState: ButterPageState,
  threeXPrice: BigNumber,
  stakeImmidiate: boolean,
  signer: string | ethers.providers.Provider | ethers.Signer,
): Promise<ethers.ContractTransaction> {
  return threeXWhale.connect(signer)["mint(uint256,int128,int128,uint256,bool)"](
    depositAmount,
    getIndexForToken(threeXPageState.selectedToken.input),
    1, // TokenIndex USDC
    getMinZapAmount(
      depositAmount,
      threeXPageState.slippage,
      threeXPrice,
      await threeXPageState.selectedToken.input.contract.decimals(),
      18,
    ),
    stakeImmidiate,
  );
}

export async function instantRedeem(
  threeXWhale: ThreeXWhaleProcessing,
  depositAmount: BigNumber,
  threeXPageState: ButterPageState,
  signer: string | ethers.providers.Provider | ethers.Signer,
): Promise<ethers.ContractTransaction> {
  return threeXWhale.connect(signer)["redeem(uint256,int128,int128,uint256)"](
    depositAmount,
    1, // TokenIndex USDC
    getIndexForToken(threeXPageState.selectedToken.output),
    0,
  );
}
