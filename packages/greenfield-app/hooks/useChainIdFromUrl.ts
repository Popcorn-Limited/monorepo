import { ChainId } from "@popcorn/greenfield-app/lib/utils/connectors";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useNetwork } from "wagmi";

function toTitleCase(toConvert: string): string {
  if (toConvert.toLowerCase() === ChainId[56].toLowerCase()) {
    return ChainId[56];
  }
  return toConvert.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}

export function useChainIdFromUrl() {
  const {chain} = useNetwork();
  const router = useRouter();
  const [chainId, setChainId] = useState<ChainId>(chain?.id || Number(process.env.CHAIN_ID));

  useEffect(() => {
    if (router?.query?.network?.length > 0) {
      setChainId(ChainId[toTitleCase(router?.query?.network as string)]);
    }
  }, [router?.query?.network]);

  return chainId;
}
