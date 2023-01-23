import deployments from "@popcorn/hardhat/lib/utils/exporter/out/deployments.json";
import { ChainId } from "@popcorn/utils";
import { useMemo } from "react";
import { ContractAddresses } from "@popcorn/utils/src/types/index";

export function useDeployment(chainId: ChainId): ContractAddresses {
  return useMemo(() => {
    let addresses: ContractAddresses = {
      all: new Set(),
      has: (contractAddress: string) => addresses.all.has(contractAddress.toLowerCase()),
    };

    Object.keys(deployments[chainId]?.contracts || {}).map((contract) => {
      const contracts = deployments[chainId]?.contracts || deployments[1].contracts;
      const address = contracts[contract].address.toLowerCase();
      addresses[contract.slice(0, 2) === "0x" ? contract.toLowerCase() : contract] = address;
      addresses[address] = contracts[contract];
      addresses.all.add(address);
    });

    return addresses;
  }, [chainId]);
}
