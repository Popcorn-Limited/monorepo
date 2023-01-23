import { Yearn } from "@yfi/sdk";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";

let dirtyYearnClient = null as any;
const store = {};
export const apy = async ({ address, chainId, rpc }): Promise<{ value: BigNumber; decimals: number }> => {
  const yearn =
    dirtyYearnClient ||
    new Yearn(Number(chainId) as 1 | 250 | 1337 | 42161, {
      provider: rpc,
      subgraph: {
        mainnetSubgraphEndpoint: "https://api.thegraph.com/subgraphs/name/rareweasel/yearn-vaults-v2-subgraph-mainnet",
      },
    });

  const storeKey = `${address}:${chainId}`;
  const memoizedAPY = store[storeKey];

  if (memoizedAPY && yearn) return memoizedAPY;
  // Early exit if memoed
  dirtyYearnClient = yearn;
  const [vault] = await yearn.vaults.get([address]);
  store[storeKey] = { value: parseEther(`${vault.metadata.apy?.net_apy || "0"}`), decimals: 18 };
  return store[storeKey];
};
