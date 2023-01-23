import { PopLocker__factory } from "@popcorn/hardhat/typechain";
import { ChainId } from "@popcorn/utils";
import { PopLockerMetadata } from "./../../helper/getStakingPool";
import { isAddress } from "ethers/lib/utils";
import { useRpcProvider } from "@popcorn/app/hooks/useRpcProvider";
import { getPopLocker } from "../../helper/getStakingPool";
import { useMemo } from "react";
import useSWR, { SWRResponse } from "swr";
import useWeb3 from "@popcorn/app/hooks/useWeb3";

export default function usePopLocker(address: string, chainId: ChainId): SWRResponse<PopLockerMetadata, Error> {
  const { account } = useWeb3();
  const active = [ChainId.Polygon, ChainId.Ethereum, ChainId.Localhost].includes(chainId);
  const provider = useRpcProvider(chainId);
  const popLocker = useMemo(
    () => isAddress(address) && active && !!chainId && !!provider && PopLocker__factory.connect(address, provider),
    [chainId, address, provider],
  );

  const shouldFetch = popLocker && !!chainId && active;
  return useSWR(shouldFetch ? [`getPopLockerInfo`, popLocker, chainId, account] : null, (key) => getPopLocker(...key));
}
