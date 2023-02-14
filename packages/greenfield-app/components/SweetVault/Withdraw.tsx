import type { Pop } from "@popcorn/components/lib/types";
import { Fragment } from "react";
import { useAccount } from "wagmi";
import { constants } from "ethers";
import { useNamedAccounts } from "@popcorn/components/lib/utils";
import AssetInputWithAction from "@popcorn/components/components/AssetInputWithAction";

function Withdraw({
  vault,
  chainId,
  vaultTokenAddress,
}: {
  vault: Pop.NamedAccountsMetadata;
  vaultTokenAddress: string;
  chainId: any;
}) {
  const [vaultRouter] = useNamedAccounts(chainId, ["vaultRouter"]);
  const { address } = useAccount();
  return (
    <div className="flex flex-col gap-8">
      <AssetInputWithAction
        assetAddress={vault.address}
        target={vaultRouter.address}
        chainId={chainId}
        action={(balance) => {
          return {
            label: "Withdraw",
            abi: [
              "function redeemAndWithdraw(address vault, uint256 burnAmount, address receiver, address owner) external",
            ],
            functionName: "redeemAndWithdraw",
            successMessage: "Withdraw successful!",
            args: [vault.address, balance, address, vaultTokenAddress],
          };
        }}
        allowance={constants.MaxUint256}
      >
        {({ ActionableComponent }) => {
          return (
            <Fragment>
              <div className="flex-grow" />
              <ActionableComponent />
            </Fragment>
          );
        }}
      </AssetInputWithAction>
    </div>
  );
}

export default Withdraw;
