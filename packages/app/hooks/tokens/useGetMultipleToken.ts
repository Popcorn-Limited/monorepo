import { ERC20 } from "@popcorn/hardhat/typechain";
import { ChainId } from "@popcorn/utils";
import { getMultipleToken } from "@popcorn/app/helper/getToken";
import { Token } from "@popcorn/utils/src/types";
import { useMemo } from "react";
import useSWR, { SWRResponse } from "swr";
import useWeb3 from "@popcorn/app/hooks/useWeb3";

export default function useGetMultipleToken(
  tokenContracts: ERC20[] | null,
  chainId: ChainId,
  spender?: string,
): SWRResponse<Token[], Error> {
  const { account, rpcProvider } = useWeb3();
  const shouldFetch = tokenContracts?.length > 0;
  const tokenAddresses = useMemo(() => tokenContracts?.map((erc20) => erc20.address), [tokenContracts]);

  return useSWR(
    shouldFetch ? [`getMultipleToken-${tokenAddresses}`, account, chainId, tokenContracts, spender] : null,
    async () => getMultipleToken(tokenContracts, rpcProvider, chainId, account, spender),
    { refreshInterval: 2000 },
  );
}
