import { isAddress } from "@ethersproject/address";
import { ChainId } from "@popcorn/utils";
import { BigNumber, constants } from "ethers";
import useSWR, { SWRResponse } from "swr";
import useERC20 from "@popcorn/app/hooks/tokens/useERC20";

export default function useTokenAllowance(
  address: string | undefined,
  chainId: ChainId,
  owner?: string | null,
  spender?: string,
): SWRResponse<BigNumber, Error> {
  const token = useERC20(address, chainId);
  return useSWR(
    [`${token?.address}/allowance/${owner}/${spender}`, owner, spender],
    async () => {
      if (!isAddress(spender) || !isAddress(owner) || !token) {
        return constants.Zero;
      }
      return await token?.contract.allowance(owner, spender);
    },
    {
      refreshInterval: 3 * 1000,
      dedupingInterval: 3 * 1000,
    },
  );
}
