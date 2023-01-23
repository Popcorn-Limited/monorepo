import { useMemo } from "react";
import { useNetwork } from "wagmi";
import { useIsConnected } from "./useIsConnected";
import useNetworkNameFromUrl from "./useNetworkNameFromUrl";

export const useChainUrl = () => {
  const { chain } = useNetwork();
  const isConnected = useIsConnected();
  const networkNameFromUrl = useNetworkNameFromUrl();

  const chainUrl = (name?: string) => {
    name = name?.toLowerCase().replace(" ", "-");

    switch (name?.toLowerCase()) {
      case "arbitrum-one":
        return "arbitrum";
      default:
        return name;
    }
  };

  const network = useMemo(() => {
    return (isConnected && chainUrl(chain?.name)) || networkNameFromUrl || "ethereum";
  }, [networkNameFromUrl, isConnected, chain?.name]);

  return (url) => {
    if (url && url[0] === "/") {
      url = url.slice(1, url.length);
    }
    return "/" + network + "/" + url;
  };
};
