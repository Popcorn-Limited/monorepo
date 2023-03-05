import type { Pop } from "@popcorn/components/lib/types";
import { Fragment } from "react";

import useFeeModal from "@popcorn/greenfield-app/components/vaults/useFeeModal";
import AssetInputWithAction from "@popcorn/components/components/AssetInputWithAction";
import { useNamedAccounts } from "@popcorn/components/lib/utils";
import { constants } from "ethers";
import SecondaryActionButton from "@popcorn/components/components/SecondaryActionButton";

function Deposit({
  vault,
  vaultTokenAddress,
  chainId,
}: {
  vault: Pop.NamedAccountsMetadata;
  vaultTokenAddress: string;
  chainId: any;
}) {
  const [vaultRouter] = useNamedAccounts(chainId, ["vaultRouter"]);
  const { openModal } = useFeeModal(vault.address);

  return (
    <div className="flex flex-col gap-8">
      <AssetInputWithAction
        assetAddress={vaultTokenAddress}
        target={vaultRouter.address}
        chainId={chainId}
        action={(balance) => {
          return {
            label: "Deposit",
            abi: ["function depositAndStake(address vault, uint256 assetAmount, address receiver) external"],
            functionName: "depositAndStake",
            successMessage: "Deposit successful!",
            args: [vault.address, balance, vaultTokenAddress],
          };
        }}
        allowance={constants.MaxUint256}
      >
        {({ ActionableComponent }) => {
          return (
            <Fragment>
              <div className="flex-grow" />
              <section className="bg-warmGray/20 rounded-lg w-full">
                <SecondaryActionButton handleClick={openModal} label="Popcorn fees breakdown" />
              </section>
              <ActionableComponent />
            </Fragment>
          );
        }}
      </AssetInputWithAction>
    </div>
  );
}

export default Deposit;
