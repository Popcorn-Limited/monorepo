import { useAccount } from "wagmi";
import { constants } from "ethers";
import { useNamedAccounts } from "@popcorn/components/lib/utils";
import AssetInputWithAction from "@popcorn/components/components/AssetInputWithAction";
import FeeBreakdown from "./FeeBreakdown";

function Withdraw({
  vault,
  chainId,
  vaultTokenAddress,
}: {
  vault: string;
  vaultTokenAddress: string;
  chainId: any;
}) {
  const [vaultRouter] = useNamedAccounts(chainId, ["vaultRouter"]);
  const { address } = useAccount();

  return (
    <div className="flex flex-col">
      <AssetInputWithAction
        assetAddress={vault}
        target={vault}
        chainId={chainId}
        action={(balance) => {
          return {
            label: "Withdraw",
            abi: [
              "function redeemAndWithdraw(address vault, uint256 burnAmount, address receiver, address owner) external",
              "function redeem(uint256 burnAmount) external"
            ],
            functionName: "redeem",
            successMessage: "Withdraw successful!",
            args: [balance],
          };
        }}
        allowance={constants.MaxUint256}
      >
        {({ ActionableComponent }) => {
          return <FeeBreakdown vault={vault} ActionableComponent={ActionableComponent}/>;
        }}
      </AssetInputWithAction>
    </div>
  );
}

export default Withdraw;

