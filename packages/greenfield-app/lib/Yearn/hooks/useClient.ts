import { Yearn } from "@yfi/sdk";
import { useMemo } from "react";
import { useProvider } from "wagmi";

export const useClient = ({ chainId }) => {
  const provider = useProvider();
  const client = useMemo(() => {
    return new Yearn(chainId, {
      provider: provider as any,
      subgraph: {
        mainnetSubgraphEndpoint: "https://api.thegraph.com/subgraphs/name/rareweasel/yearn-vaults-v2-subgraph-mainnet",
      },
    });
  }, [chainId]);
  return client;
};
