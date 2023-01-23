import { useMemo } from "react";
import { DeploymentChainIds, DeploymentContractsKeys, getNamedAccounts } from "@popcorn/utils";

/**
 * useNamedAccounts retrieves contract metadata from namedAccounts.json
 * @returns contract metadata from namedAccounts.json
 */
export const useNamedAccounts = <Chain extends DeploymentChainIds>(
  chainId: Chain | undefined,
  contractAddresses?: DeploymentContractsKeys<Chain>[] | undefined[],
) => {
  // the following memoization will convert the array of contract addresses returned by getNamedAccounts into a mapping of contract addresses & aliases to contract metadata so that we can quickly retrieve the contract metadata for a given contract address. it also converts all addresses to lowercase and adds the contract alias as a key to the mapping. this allows the client to pass in contract addresses or aliases and get the contract metadata for that contract regardless of the formatting of the contract address.
  const mapping = useMemo(
    () =>
      (!!chainId &&
        getNamedAccounts(chainId).reduce(
          (contractMap, contract) => ({
            ...contractMap,
            [chainId]: {
              ...contractMap[chainId],
              [contract.address]: contract,
              [contract.address.toLowerCase()]: contract,
              [contract.__alias]: contract,
            },
          }),
          {} as Mapping,
        )) ||
      {},
    [chainId],
  );

  return useMemo(
    () => (!!chainId && !!contractAddresses && contractAddresses.map((contract) => mapping[chainId][contract])) || [],
    [chainId, mapping, contractAddresses],
  );
};
export default useNamedAccounts;

export interface Mapping {
  [chainId: string]: { [contractAddressOrAlias: string]: any };
}
