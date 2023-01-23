import { useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";

export const useIsConnected = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (connected !== !!address) {
      setConnected(!!address);
    }
  }, [connected, address, chain]);

  return connected;
};
