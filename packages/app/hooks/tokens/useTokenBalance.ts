import { isAddress } from "@ethersproject/address";
import { BigNumber, constants } from "ethers";
import useSWR, { SWRResponse } from "swr";
import { ChainId } from "@popcorn/utils/src/connectors";
import useERC20 from "@popcorn/app/hooks/tokens/useERC20";

export default function useTokenBalance(
  address: string,
  account: string | undefined | null,
  chainId: ChainId,
): SWRResponse<BigNumber, Error> {
  const token = useERC20(address, chainId);
  return useSWR(
    [`erc20/${address}/balanceOf/${account}`, account],
    async () => {
      if (!isAddress(address) || !isAddress(account) || !token) {
        return constants.Zero;
      }
      return token?.contract.balanceOf(account);
    },
    {
      refreshInterval: 3 * 1000,
      dedupingInterval: 5 * 1000,
    },
  );
}
