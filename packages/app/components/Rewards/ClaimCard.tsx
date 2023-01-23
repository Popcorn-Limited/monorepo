import { PopLocker, Staking } from "@popcorn/hardhat/typechain";
import MainActionButton from "@popcorn/app/components/MainActionButton";
import TokenIcon from "@popcorn/app/components/TokenIcon";
import { BigNumber, constants, Signer } from "ethers";
import { ChainId, formatAndRoundBigNumber, networkLogos } from "@popcorn/utils";
import { useContractMetadata } from "@popcorn/app/hooks/useContractMetadata";
import { setMultiChoiceActionModal } from "@popcorn/components/context/actions";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { useTransaction } from "@popcorn/app/hooks/useTransaction";
import { useContext } from "react";
import { store } from "@popcorn/components/context/store";

interface ClaimCardProps {
  disabled: boolean;
  tokenAddress: string;
  tokenName: string;
  claimAmount: BigNumber;
  pool: Staking | PopLocker;
  isPopLocker?;
  chainId: ChainId;
}

const ClaimCard: React.FC<ClaimCardProps> = ({
  disabled,
  tokenName,
  tokenAddress,
  claimAmount,
  pool,
  isPopLocker = false,
  chainId,
}) => {
  const { account, signer } = useWeb3();
  const { dispatch } = useContext(store);
  const metadata = useContractMetadata(tokenAddress, chainId);
  const transaction = useTransaction(chainId);

  const poolClaimHandler = async (pool: Staking | PopLocker, isPopLocker: boolean, signer: Signer, account: string) => {
    transaction(
      () => pool.connect(signer).getReward(isPopLocker ? account : null),
      "Claiming Reward...",
      "Rewards Claimed!",
      () => {
        if (!localStorage.getItem("hideClaimModal")) {
          dispatch(
            setMultiChoiceActionModal({
              image: <img src="/images/modalImages/vestingImage.svg" />,
              title: "Sweet!",
              content:
                "You have just claimed 10% of your earned rewards. The rest of the rewards will be claimable over the next 365 days",
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
                  localStorage.setItem("hideClaimModal", "true");
                  dispatch(setMultiChoiceActionModal(false));
                },
              },
            }),
          );
        }
      },
    );
  };

  return (
    <div
      className={`hover:scale-102 transition duration-500 ease-in-out transform w-full md:h-48 border-b border-customLightGray border-opacity-40   ${
        !claimAmount || claimAmount?.eq(constants.Zero) ? "hidden" : ""
      }`}
    >
      <img src={networkLogos[chainId]} alt={ChainId[chainId]} className="w-4.5 h-4" />
      <div className="flex flex-col md:flex-row justify-between pt-4 pb-6 md:px-8">
        <div className="flex flex-col justify-between">
          <div className="flex flex-row items-center">
            <div>
              <TokenIcon token={tokenAddress} chainId={chainId} fullsize />
            </div>
            <h1
              className={`text-2xl md:text-4xl leading-7 md:leading-12 mt-1 ml-4 text-black line-clamp-2 overflow-hidden`}
            >
              {metadata?.name ? metadata.name : tokenName}
            </h1>
          </div>
          <div className="my-6 md:my-0">
            <p className="text-primaryLight leading-6">Rewards</p>
            <h1 className={`text-2xl md:text-3xl leading-8 text-primary`}>
              {formatAndRoundBigNumber(claimAmount, 18)} <span className=" text-tokenTextGray text-xl"> POP</span>
            </h1>
          </div>
        </div>
        <div>
          <MainActionButton
            handleClick={() => {
              poolClaimHandler(pool, isPopLocker, signer, account);
            }}
            label="Claim"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default ClaimCard;
