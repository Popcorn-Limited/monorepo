import { RewardsEscrow } from "@popcorn/hardhat/typechain";
import { BigNumber, constants } from "ethers";
import useSWR, { SWRResponse } from "swr";
import { ChainId } from "@popcorn/utils/src/connectors";
import { useRpcProvider } from "@popcorn/app/hooks/useRpcProvider";
import useVestingEscrow from "@popcorn/app/hooks/useVestingEscrow";

export type Escrow = {
  start: BigNumber;
  lastUpdateTime: BigNumber;
  end: BigNumber;
  balance: BigNumber;
  account: string;
  claimableAmount: BigNumber;
  id: string;
};

const getEscrowsByIds = async (vestingEscrow: RewardsEscrow, escrowIds: string[]) => {
  const result = [];
  const escrows = await vestingEscrow.getEscrows(escrowIds);
  escrows.forEach((escrow, index) => {
    result.push({
      lastUpdateTime: escrow.lastUpdateTime.mul(1000),
      end: escrow.end.mul(1000),
      balance: escrow.balance,
      account: escrow.account,
      id: escrowIds[index],
    });
  });
  return result;
};

const getUserEscrows = async (account: string, vestingEscrow: RewardsEscrow) => {
  const escrowIds: string[] = await vestingEscrow.getEscrowIdsByUser(account);
  if (escrowIds.length === 0) {
    return { escrows: new Array(0), totalClaimablePop: constants.Zero, totalVestingPop: constants.Zero };
  }
  let totalClaimablePop: BigNumber = constants.Zero;
  let totalVestingPop: BigNumber = constants.Zero;
  const escrows = (await getEscrowsByIds(vestingEscrow, escrowIds))
    .filter((escrow) => escrow.balance.gt(constants.Zero))
    .filter((escrow) => !BAD_ESCROW_IDS.includes(escrow.id));

  for (let i = 0; i < escrows.length; i++) {
    escrows[i].claimableAmount = await (async () => {
      let claimable;
      try {
        claimable = await vestingEscrow.getClaimableAmount(escrows[i].id);
      } catch (e) {
        claimable = BigNumber.from(0);
      }
      return claimable;
    })();
    totalVestingPop = totalVestingPop.add(escrows[i].balance.sub(escrows[i].claimableAmount));
    totalClaimablePop = totalClaimablePop.add(escrows[i].claimableAmount);
  }
  escrows.sort((a, b) => a.end.toNumber() - b.end.toNumber());
  return {
    escrows,
    totalClaimablePop,
    totalVestingPop,
  };
};

export function useGetUserEscrows(
  address: string,
  account: string,
  chainId: ChainId,
): SWRResponse<{ escrows: Escrow[]; totalClaimablePop: BigNumber; totalVestingPop: BigNumber }, Error> {
  const provider = useRpcProvider(chainId);
  const vestingEscrow = useVestingEscrow(address, chainId);
  const shouldFetch = !!vestingEscrow && !!account && !!provider;
  return useSWR(
    shouldFetch ? ["getUserEscrows", account, vestingEscrow, chainId, provider] : null,
    ([_, account, vestingEscrow]) => getUserEscrows(account, vestingEscrow),
    {
      refreshInterval: 20000,
    },
  );
}
export default useGetUserEscrows;

const BAD_ESCROW_IDS = ["0xb5e39b26e424fc1affd47eaa035ac492b765b6dae4985c2762d829f986b43418"];
