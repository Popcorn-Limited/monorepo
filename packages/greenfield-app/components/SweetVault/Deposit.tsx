import AssetInputWithAction from "@popcorn/components/components/AssetInputWithAction";
import { useNamedAccounts } from "@popcorn/components/lib/utils";
import { constants } from "ethers";
import useVaultFees from "hooks/vaults/useVaultFees";
import { formatAndRoundBigNumber } from "@popcorn/utils";
import FeeBreakdown from "./FeeBreakdown";

function Deposit({
  vault,
  vaultTokenAddress,
  chainId,
}: {
  vault: string;
  vaultTokenAddress: string;
  chainId: any;
}) {
  const [vaultRouter] = useNamedAccounts(chainId, ["vaultRouter"]);
  const fees = useVaultFees(vault);

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
        allowance={constants.MaxUint256}
      >
        {({ ActionableComponent }) => {
          return <FeeBreakdown vault={vault} ActionableComponent={ActionableComponent} />;
        }}
      </AssetInputWithAction>
    </div>
  );
}

export default Deposit;