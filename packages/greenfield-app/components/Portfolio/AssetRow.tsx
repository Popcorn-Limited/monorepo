import type { BigNumberWithFormatted, Pop } from "@popcorn/greenfield-app/lib/types";
import { BigNumber, constants } from "ethers";
import { useState } from "react";

import { NetworkSticker } from "@popcorn/greenfield-app/components/NetworkSticker";
import TokenIcon from "@popcorn/greenfield-app/components/TokenIcon";
import { formatAndRoundBigNumber } from "@popcorn/utils";

import { getPercentage } from "@popcorn/greenfield-app/lib/utils/numbers";
import { Contract } from "@popcorn/greenfield-app/lib";
import AssetCell from "./AssetCell";

export default function AssetRow({
  chainId,
  badge,
  token,
  networth,
  price,
  balance,
  callback,
  status,
  name,
}: Partial<{
  chainId: any;
  badge: any;
  address: string;
  networth?: BigNumber;
  price: BigNumberWithFormatted;
  balance: BigNumberWithFormatted;
  callback;
  name: string;
  token: Pop.NamedAccountsMetadata;
  status;
}>) {
  const [rawBalance, setRawBalance] = useState(constants.Zero);

  const proxyCallback = (value?: BigNumber) => {
    if (value && value.gt(0)) setRawBalance(value);
    callback?.(value);
  };

  return (
    <tr className={`${balance?.value?.gt(0) ? "" : "hidden"}`}>
      <td className="md:bg-customLightGray md:bg-opacity-[10%] rounded-l-2xl py-2 md:py-4 pl-2 md:pl-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <NetworkSticker chainId={chainId} />
            <TokenIcon token={token?.address || ""} chainId={chainId} />
          </div>
          <div className="flex space-x-[6px] md:space-x-[52px]">
            <div>
              <p className="font-medium text-xs md:text-lg">{name}</p>
              <p className="text-tokenTextGray text-[10px] md:text-base">
                ${formatAndRoundBigNumber(price?.value || constants.Zero, 18)}
              </p>
            </div>
          </div>
          {badge}
        </div>
      </td>
      <AssetCell>{getPercentage(networth, rawBalance)}%</AssetCell>
      <AssetCell>
        <Contract.Value status={status} balance={balance?.value} price={price?.value} callback={proxyCallback} />
        <p className="text-tokenTextGray text-[10px] md:text-base">
          {balance?.formatted} {token?.symbol || "POP"}
        </p>
      </AssetCell>
    </tr>
  );
}
