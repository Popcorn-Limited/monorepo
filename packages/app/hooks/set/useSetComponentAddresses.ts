import { ChainId } from "@popcorn/utils";
import { Address } from "@popcorn/utils/types";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import { useMemo } from "react";

export default function useSetComponentAddresses(setToken: Address): string[] {
  const addresses = useDeployment(ChainId.Ethereum);

  return useMemo(() => {
    switch (setToken) {
      case addresses.butter:
        return [addresses.yFrax, addresses.yRai, addresses.yMusd, addresses.yAlusd];
      case addresses.threeX:
        return [addresses.ySusd, addresses.y3Eur];
      default:
        return [];
    }
  }, [addresses, setToken]);
}
