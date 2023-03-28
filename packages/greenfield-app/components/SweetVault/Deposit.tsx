import AssetInputWithAction from "@popcorn/components/components/AssetInputWithAction";
import FeeBreakdown from "./FeeBreakdown";
import { useAllowance } from "@popcorn/components/lib/Erc20/hooks";
import { Address, useAccount } from "wagmi";
import { useNamedAccounts } from "@popcorn/components/lib/utils";
import { constants } from "ethers";

function Deposit({
  vault,
  asset,
  chainId,
  staking,
  getTokenUrl
}: {
  vault: string;
  asset: string;
  chainId: any;
  staking: string
  getTokenUrl?: string;
}) {
  const usesStaking = staking?.toLowerCase() !== constants.AddressZero.toLowerCase();
  const { address: account } = useAccount();
  const [router] = useNamedAccounts(chainId, ["vaultRouter"]);

  const { data: allowance } = useAllowance({ address: asset, account: (usesStaking ? router?.address : vault) as Address, chainId });

  return (
    <div className="flex flex-col">
      <AssetInputWithAction
        assetAddress={asset}
        target={(usesStaking ? router?.address : vault) as string}
        chainId={chainId}
        action={(balance) => {
          return {
            label: "Deposit",
            abi: ["function depositAndStake(address vault, uint256 assetAmount, address receiver) external", "function deposit(uint256 assetAmount) external"],
            functionName: usesStaking ? "depositAndStake" : "deposit",
            successMessage: "Deposit successful!",
            args: usesStaking ? [vault, balance, account] : [balance],
          };
        }}
        allowance={allowance?.value}
        getTokenUrl={getTokenUrl}
      >
        {({ ActionableComponent }) => {
          return (
            <>
              <FeeBreakdown vault={vault} />
              <ActionableComponent />
            </>);
        }}
      </AssetInputWithAction>
    </div>
  );
}

export default Deposit;