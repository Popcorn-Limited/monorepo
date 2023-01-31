import type { Pop } from "@popcorn/components/lib/types";
import { FormEventHandler, useMemo, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { utils } from "ethers";
import toast from "react-hot-toast";

import useFeeModal from "@popcorn/greenfield-app/components/vaults/useFeeModal";
import { useApproveVaultBalance, useDepositVaultBalance } from "@popcorn/components/hooks/vaults";
import useTokenAllowance from "@popcorn/app/hooks/tokens/useTokenAllowance";
import { validateInput } from "./internals/input";

import { ChainId } from "@popcorn/utils";
import AssetInput from "./AssetInput";
import SecondaryActionButton from "@popcorn/components/components/SecondaryActionButton";
import MainActionButton from "@popcorn/components/components/MainActionButton";

function Deposit({
  vault,
  vaultTokenAddress,
  vaultTokenDecimals,
  chainId,
}: {
  vault: Pop.NamedAccountsMetadata;
  vaultTokenAddress: string;
  vaultTokenDecimals: number;
  chainId: any;
}) {
  const { openModal } = useFeeModal(vault.address);
  const [inputBalance, setInputBalance] = useState<number>();
  const { address } = useAccount();

  const { data: userBalance } = useBalance({
    chainId,
    address,
    token: vaultTokenAddress as any,
    watch: true,
  });

  const formattedInputBalance = useMemo(() => {
    return utils.parseUnits(validateInput(inputBalance).formmatted, vaultTokenDecimals);
  }, [inputBalance]);

  const { data: allowance } = useTokenAllowance(vaultTokenAddress, chainId, address, vault.address);

  const {
    write: approveBalance,
    isSuccess: isApproveSuccess,
    isLoading: isApproveLoading,
  } = useApproveVaultBalance(vault.address, vaultTokenAddress, ChainId.Localhost, {
    onSuccess: () => {
      toast.success("Assets approved!", {
        position: "top-center",
      });
    },
  });

  const { write: depositBalance } = useDepositVaultBalance(vault.address, ChainId.Localhost, formattedInputBalance, {
    onSuccess: () => {
      toast.success("Transaction completed!", {
        position: "top-center",
      });
      // reset input balance
      setInputBalance("" as any);
    },
  });

  // When approved asume allowance has been approved
  const showApproveButton = isApproveSuccess ? false : formattedInputBalance.gt(allowance || 0);

  async function handleDeposit() {
    if ((inputBalance || 0) == 0) return;
    // Early exit if value is ZERO

    if (showApproveButton) return approveBalance();
    // When approved continue to deposit
    depositBalance();
  }

  const handleChangeInput: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setInputBalance(validateInput(value).isValid ? (value as any) : 0);
  };

  const handleMaxClick = () => setInputBalance((userBalance?.formatted as any) || 0);

  const errorMessage = useMemo(() => {
    return inputBalance > Number(userBalance?.formatted) && "* Balance not available";
  }, [inputBalance]);

  const isEmptyBalance = formattedInputBalance.eq(0) || userBalance?.value.eq(0);
  const hideMainButton = isEmptyBalance || isApproveLoading || errorMessage != "";

  return (
    <div className="flex flex-col gap-8">
      <AssetInput
        captionText="Deposit Amount"
        onMaxClick={handleMaxClick}
        chainId={chainId}
        value={inputBalance}
        onChange={handleChangeInput}
        vaultTokenAddress={vaultTokenAddress}
        assetBalance={userBalance?.value}
        errorMessage={errorMessage}
      />
      <div className="flex-grow" />
      <section className="bg-warmGray/20 rounded-lg w-full">
        <SecondaryActionButton handleClick={openModal} label="Popcorn fees breakdown" />
      </section>
      <MainActionButton disabled={hideMainButton} handleClick={handleDeposit} type="button" label={showApproveButton ? "Approve" : "Deposit"} />
    </div>
  );
}

export default Deposit;
