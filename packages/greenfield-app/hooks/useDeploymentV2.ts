import { useMemo } from "react";
import deployments from "@popcorn/hardhat/lib/utils/exporter/out/deployments.json";

export type Deployments = typeof deployments;

type DeploymentContractsKeys<ChainId extends keyof Deployments> = keyof Deployments[ChainId]["contracts"];
export type DeploymentChainIds = keyof Deployments;

export type ContractAddresses<ChainId extends keyof Deployments> = {
  [key in DeploymentContractsKeys<ChainId>]: Deployments[ChainId]["contracts"][keyof Deployments[ChainId]["contracts"]];
} & { all: Set<string>; has: (contractAddress: string) => boolean };

export function useDeploymentV2<Chain extends DeploymentChainIds>(chainId: Chain) {
  return useMemo(() => {
    let addresses = {
      all: new Set(),
      has: (contractAddress: string) => addresses.all.has(contractAddress.toLowerCase()),
    };
    if (!chainId) return addresses as ContractAddresses<Chain>;

    Object.keys(deployments[chainId].contracts).map((contract) => {
      const contracts = deployments[chainId].contracts || deployments[1].contracts;
      const address = deployments[chainId].contracts[contract];
      addresses[contract.slice(0, 2) === "0x" ? contract.toLowerCase() : contract] = address;
      addresses[address] = contracts[contract];
      addresses.all.add(address);
    });

    return addresses as ContractAddresses<Chain>;
  }, [chainId]);
}
