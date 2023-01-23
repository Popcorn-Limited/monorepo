import type { TransactionResponse } from "@ethersproject/providers";
import { ChainId } from "@popcorn/utils";
import { isAddress } from "ethers/lib/utils";
import { useCallback } from "react";
// import ERC20ABI from "abis/ERC20.json";
import useVestingEscrow from "@popcorn/app/hooks/useVestingEscrow";
import useWeb3 from "@popcorn/app/hooks/useWeb3";

export default function useClaimEscrows(address: string, chainId: ChainId) {
  const { account, signer } = useWeb3();
  const vestingEscrow = useVestingEscrow(address, chainId);
  return useCallback(
    async (escrowIds: string[]): Promise<TransactionResponse | null> => {
      if (
        !escrowIds.length ||
        !account ||
        !chainId ||
        !isAddress(address) ||
        !vestingEscrow ||
        (await vestingEscrow.provider.getNetwork()).chainId !== chainId
      ) {
        return null;
      }
      if (escrowIds.length === 1) {
        return vestingEscrow.connect(signer).claimReward(escrowIds[0]);
      } else {
        return vestingEscrow.connect(signer).claimRewards(escrowIds);
      }
    },
    [account, signer, chainId, vestingEscrow],
  );
}
