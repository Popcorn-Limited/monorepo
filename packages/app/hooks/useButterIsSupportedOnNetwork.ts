import { isButterSupportedOnCurrentNetwork } from "@popcorn/utils";
import { useMemo } from "react";
import { useNetwork } from "wagmi";
import { useIsConnected } from "./useIsConnected";

export const useButterIsSupportedOnNetwork = () => {
  const isConnected = useIsConnected();
  const { chain: connectedChain } = useNetwork();

  const butterIsSupportedOnNetwork = useMemo(() => {
    return connectedChain?.id > 0 ? isButterSupportedOnCurrentNetwork(connectedChain?.id) : false;
  }, [isConnected, connectedChain?.id]);

  return butterIsSupportedOnNetwork;
};
