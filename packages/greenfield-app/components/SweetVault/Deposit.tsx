import AssetInputWithAction from "@popcorn/components/components/AssetInputWithAction";
import FeeBreakdown from "./FeeBreakdown";
import { useAllowance } from "@popcorn/components/lib/Erc20/hooks";
import { Address } from "wagmi";
import Link from "next/link";
import RightArrowIcon from "@popcorn/components/components/SVGIcons/RightArrowIcon";

function Deposit({
  vault,
  vaultTokenAddress,
  chainId,
  getTokenUrl
}: {
  vault: string;
  vaultTokenAddress: string;
  chainId: any;
  getTokenUrl?: string;
}) {
  const { data: allowance } = useAllowance({ address: vaultTokenAddress, account: vault as Address, chainId })

  return (
    <div className="flex flex-col">
      <AssetInputWithAction
        assetAddress={vaultTokenAddress}
        target={vault}
        chainId={chainId}
        action={(balance) => {
          return {
            label: "Deposit",
            abi: ["function depositAndStake(address vault, uint256 assetAmount, address receiver) external", "function deposit(uint256 assetAmount) external"],
            functionName: "deposit",
            successMessage: "Deposit successful!",
            args: [balance],
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