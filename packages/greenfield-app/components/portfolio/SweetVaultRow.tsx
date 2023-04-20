import { NetworkSticker } from "@popcorn/app/components/NetworkSticker";
import TokenIcon from "@popcorn/app/components/TokenIcon";
import AssetCell from "@popcorn/components/components/Portfolio/AssetCell";
import useVaultToken from "@popcorn/components/hooks/useVaultToken";
import { useBalanceOf, useTotalSupply } from "@popcorn/components/lib/Erc20/hooks";
import { usePrice } from "@popcorn/components/lib/Price";
import { useTotalAssets } from "@popcorn/components/lib/Vault/hooks";
import useVaultMetadata from "@popcorn/components/lib/Vault/hooks/useVaultMetadata";
import { getPercentage } from "@popcorn/components/lib/utils/numbers";
import { ChainId, formatAndRoundBigNumber } from "@popcorn/utils";
import { BigNumber, constants } from "ethers";
import { parseUnits } from "ethers/lib/utils.js";
import { useEffect, useState } from "react";
import { Address, useToken } from "wagmi";

export default function SweetVaultRow({ vaultAddress, chainId, account, callback, networth }): any {
  const { data: token } = useVaultToken(vaultAddress, chainId);
  const vaultMetadata = useVaultMetadata(vaultAddress, chainId);
  const usesStaking = vaultMetadata?.staking?.toLowerCase() !== constants.AddressZero.toLowerCase();

  const { data: vaultBalance } = useBalanceOf({ address: vaultAddress as Address, chainId, account });
  const { data: stakedBalance } = useBalanceOf({ address: vaultMetadata?.staking as Address, chainId, account });
  const balance = usesStaking ? stakedBalance : vaultBalance

  const { data: price } = usePrice({ address: token?.address as Address, chainId });
  const { data: totalAssets } = useTotalAssets({ address: vaultAddress as Address, chainId, account });
  const { data: totalSupply } = useTotalSupply({ address: vaultAddress as Address, chainId, account });
  const [pps, setPps] = useState<number>(0);
  const [depositValue, setDepositValue] = useState<BigNumber>(constants.Zero)

  useEffect(() => {
    if (totalAssets && totalSupply && price
      && Number(totalAssets?.value?.toString()) > 0 && Number(totalSupply?.value?.toString()) > 0) {
      setPps(Number(totalAssets?.value?.toString()) / Number(totalSupply?.value?.toString()) * (10 ** 9));
    }
  }, [balance, totalAssets, totalSupply, price])

  useEffect(() => {
    if (price && balance && pps > 0) {
      const _depositValue = (pps * Number(balance?.value?.toString())) / (10 ** (token?.decimals + 9))

      if (_depositValue > 0.01) {
        setDepositValue(parseUnits(String(_depositValue)))
        callback?.(parseUnits(String(_depositValue)));
      }

    }
  }, [balance, price, pps])


  return (
    <tr className={`${balance?.value?.gt(0) ? "" : "hidden"}`}>
      <td className="md:bg-customLightGray md:bg-opacity-[10%] rounded-l-2xl py-2 md:py-4 pl-2 md:pl-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <NetworkSticker selectedChainId={chainId} />
            <TokenIcon token={token?.address || ""} chainId={chainId} />
          </div>
          <div className="flex space-x-[6px] md:space-x-[52px]">
            <div>
              <p className="font-medium text-xs md:text-lg">{token?.name} Vault</p>
              <p className="text-tokenTextGray text-[10px] md:text-base">
                ${pps.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      </td>
      <AssetCell>{getPercentage(networth, depositValue)}%</AssetCell>
      <AssetCell>
        <p><>{"$" + ((pps * Number(balance?.value?.toString())) / (10 ** (token?.decimals + 9))).toFixed(4)}</></p>
        <p className="text-tokenTextGray text-[10px] md:text-base">
          {(Number(balance?.value?.toString()) / (10 ** (token?.decimals + 9))).toFixed(3)} {token?.symbol || "POP"}
        </p>
      </AssetCell>
    </tr>
  )

}

