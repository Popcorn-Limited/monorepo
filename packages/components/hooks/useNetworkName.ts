import { ChainId } from "@popcorn/utils";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useNetwork } from "wagmi";

export default function useNetworkName() {
  const router = useRouter();
  const { chain } = useNetwork();
  const {isConnected} = useAccount()
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
