import { ChainId } from "@popcorn/utils";
import toTitleCase from "@popcorn/app/helper/toTitleCase";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useWeb3 from "@popcorn/app/hooks/useWeb3";

export function useChainIdFromUrl() {
  const { connectedChainId } = useWeb3();
  const router = useRouter();
  const [chainId, setChainId] = useState<ChainId>(connectedChainId || Number(process.env.CHAIN_ID));

  useEffect(() => {
    if (router?.query?.network?.length > 0) {
      setChainId(ChainId[toTitleCase(router?.query?.network as string)]);
    }
  }, [router?.query?.network]);

  return chainId;
}
