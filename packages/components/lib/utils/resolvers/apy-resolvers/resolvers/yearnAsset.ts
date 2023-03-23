import { BigNumber, Contract } from "ethers";
import { apy } from "@popcorn/components/lib/Yearn";
import { ChainId } from "@popcorn/utils";
import QueryVaultByAsset from "./QueryVaultByAsset";

const store = {};
const DEFAULT_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/rareweasel/yearn-vaults-v2-subgraph-mainnet";
const URL_BY_CHAIN_ID = {
  // Future updates
  [ChainId.Fantom]: "https://api.thegraph.com/subgraphs/name/yearn/yearn-vaults-v2-fantom",
  [ChainId.Optimism]: "https://api.thegraph.com/subgraphs/name/yearn/yearn-vaults-v2-optimism",
  [ChainId.Arbitrum]: "https://api.thegraph.com/subgraphs/name/yearn/yearn-vaults-v2-arbitrum",
  [ChainId.Ethereum]: DEFAULT_GRAPH_URL,
  default: DEFAULT_GRAPH_URL,
};

export const yearnAsset = async (
  address: string,
  chainId: ChainId,
  rpc,
): Promise<{ value: BigNumber; decimals: number }> => {
  chainId = chainId === ChainId.Localhost ? ChainId.Ethereum : chainId;
  const vault = new Contract(address, ["function asset() external view returns (address)"], rpc);
  const asset = (await vault.asset()).toLowerCase();
  const vaultAddress = await getMemoizedVault(asset, chainId);
  return apy({ address: vaultAddress, chainId, rpc });
};

async function getMemoizedVault(assetAddress: string, chainId: number) {
  const storeKey = `${chainId}:${assetAddress}`;
  if (store[storeKey]) return store[storeKey];

  // Early return when memoed data
  const URL = URL_BY_CHAIN_ID[chainId] || URL_BY_CHAIN_ID.default;
  const result = await (
    await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: QueryVaultByAsset,
        variables: { assetAddress },
      }),
    })
  ).json();
  // Response schema: `data.vaults = [{ id: string }]`

  const data = result?.data || {};
  const { vaults = [] } = data;
  // Resolve with default address call if vault not found
  store[storeKey] = vaults?.[0]?.id || assetAddress;
  return store[storeKey];
}
