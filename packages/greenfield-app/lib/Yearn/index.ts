import type { YDaemonVaultMetadata } from "./types";
import { Yearn } from "@yfi/sdk";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";

let dirtyYearnClient: Yearn<1>;
const store = {};

export const yClient = (chainId: any, rpc) => {
  dirtyYearnClient =
    dirtyYearnClient ||
    new Yearn(Number(chainId) as 1 | 250 | 1337 | 42161, {
      provider: rpc,
      subgraph: {
        mainnetSubgraphEndpoint: "https://api.thegraph.com/subgraphs/name/rareweasel/yearn-vaults-v2-subgraph-mainnet",
      },
    });

  return dirtyYearnClient;
};

export const getYDaemonVaultMetadata = (vaultAddress: string, chainId: string) =>
  fetch(`https://ydaemon.yearn.finance/${chainId}/vaults/${vaultAddress}`).then((r) =>
    r.json(),
  ) as Promise<YDaemonVaultMetadata>;

export const apy = async ({ address, chainId, rpc }): Promise<{ value: BigNumber; decimals: number }> => {
  const storeKey = `${address}:${chainId}`;
  const memoizedAPY = store[storeKey];
  if (memoizedAPY) return memoizedAPY;
  // Early exit if memoed value

  let vault: YDaemonVaultMetadata | undefined;
  try {
    vault = await getYDaemonVaultMetadata(address, chainId);
  } catch (_) {}

  store[storeKey] = { value: parseEther(`${vault?.apy.net_apy || "0"}`), decimals: 18 };
  return store[storeKey];
};
