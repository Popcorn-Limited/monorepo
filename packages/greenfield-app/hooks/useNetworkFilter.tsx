import { ChainId } from "@popcorn/greenfield-app/lib/utils/connectors";
import { useEffect, useState } from "react";

export default function useNetworkFilter(availableNetworks: ChainId[]): [ChainId[], (chainId: ChainId) => void] {
  const [selectedNetworks, selectNetworks] = useState<ChainId[]>(availableNetworks);

  useEffect(() => {
    if (selectedNetworks.length === 0) selectNetworks(availableNetworks);
  }, [selectedNetworks, availableNetworks]);

  function selectNetwork(chainId: ChainId): void {
    if (chainId == ChainId.ALL) {
      selectNetworks(availableNetworks);
    } else selectNetworks(availableNetworks.filter((network) => network == chainId));
  }

  return [selectedNetworks, selectNetwork];
}
