import { ChainId } from "@popcorn/utils";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useNetwork } from "wagmi";
import { useIsConnected } from "./useIsConnected";

export default function useNetworkName() {
  const router = useRouter();
  const { chain } = useNetwork();
  const isConnected = useIsConnected();
  const [nameFromUrl, setNameFromUrl] = useState((router?.query?.network as string) || "");

  useEffect(() => {
    if (!nameFromUrl && router?.query?.network) {
      setNameFromUrl(router?.query?.network as string);
    }
  }, [router?.query?.network]);

  return useMemo(
    () => (nameFromUrl || (isConnected && chain?.id && ChainId[chain?.id]) || ChainId[ChainId.Ethereum])?.toLowerCase(),
    [isConnected, chain?.id, nameFromUrl],
  );
}
