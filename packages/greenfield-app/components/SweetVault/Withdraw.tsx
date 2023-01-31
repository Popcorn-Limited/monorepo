import type { Pop } from "@popcorn/components/lib/types";
import { FormEventHandler, useMemo, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { utils } from "ethers";

import { useRedeemVaultBalance } from "@popcorn/components/hooks/vaults";
import { validateInput } from "./internals/input";

import AssetInput from "./AssetInput";
import toast from "react-hot-toast";
import { ChainId } from "@popcorn/utils";
import MainActionButton from "@popcorn/components/components/MainActionButton";

function Withdraw({
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
  const [inputBalance, setInputBalance] = useState<number>();
  const { address } = useAccount();

  const { data: userBalance } = useBalance({
    chainId,
    address,
    token: vault.address as any,
    // Fetch in vault balance for user
    watch: true,
  });

  const formattedInputBalance = useMemo(() => {
    return utils.parseUnits(validateInput(inputBalance).formmatted, vaultTokenDecimals);
  }, [inputBalance]);

  const { write: withdrawBalance, isLoading } = useRedeemVaultBalance(
    vault.address,
    ChainId.Localhost,
    formattedInputBalance,
    {
      onSuccess: () => {
        toast.success("Transaction completed!", {
          position: "top-center",
        });
        // reset input balance
        setInputBalance("" as any);
      },
    },
  );

  async function handleWithdraw() {
    if ((inputBalance || 0) == 0) return;
    // Early exit if value is ZERO
    withdrawBalance();
  }

  const handleChangeInput: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setInputBalance(validateInput(value).isValid ? (value as any) : 0);
  };

  const handleMaxClick = () => setInputBalance((userBalance?.formatted as any) || 0);

  const errorMessage = useMemo(() => {
    return inputBalance > Number(userBalance?.formatted) && "* Balance not available";
  }, [inputBalance]);

  const isEmptyBalance = formattedInputBalance.eq(0) || userBalance?.value.eq(0);

  return (
    <div className="flex flex-col gap-8">
      <AssetInput
        captionText="Withdraw Amount"
        onMaxClick={handleMaxClick}
        chainId={chainId}
        value={inputBalance}
        onChange={handleChangeInput}
        vaultTokenAddress={vaultTokenAddress}
        assetBalance={userBalance?.value}
        errorMessage={errorMessage}
      />
      <div className="flex-grow" />
      <MainActionButton disabled={isLoading || isEmptyBalance} handleClick={handleWithdraw} type="button" label="Withdraw"/>
    </div>
  );
}

export default Withdraw;
