import type { Pop } from "@popcorn/greenfield-app/lib/types";
import { BigNumber } from "ethers";

import { Escrow } from "@popcorn/greenfield-app/lib";
import AssetRow from "./AssetRow";

function PortfolioClaimableBalance({
  token,
  type: rewardType,
  account,
  networth,
  callback,
}: {
  token: Pop.NamedAccountsMetadata;
  account?: string;
  networth: BigNumber;
  callback: any;
  type: "vesting" | "claimable";
}) {
  const chainId = Number(token.chainId);

  const sharedProps = {
    address: token.address,
    account: account as any,
    chainId,
    networth,
    token,
  };
  const isClaimable = rewardType === "claimable";

  return (
    <Escrow.ClaimableBalanceOf
      {...sharedProps}
      render={({ balance: claimableBalance, price, status }) =>
        isClaimable ? (
          <AssetRow
            {...sharedProps}
            callback={callback}
            name={token.symbol || "Popcorn"}
            balance={claimableBalance}
            status={status}
            price={price}
          />
        ) : (
          <Escrow.VestingBalanceOf
            {...sharedProps}
            render={({ balance: vestingBalance, price, status }) => (
              <AssetRow
                {...sharedProps}
                callback={callback}
                name="Popcorn"
                balance={vestingBalance}
                status={status}
                price={price}
              />
            )}
          />
        )
      }
    />
  );
}

export default PortfolioClaimableBalance;
