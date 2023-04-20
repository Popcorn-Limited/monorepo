import { ChainId } from "@popcorn/greenfield-app/lib/utils/connectors";
import { useContractWrite } from "wagmi";

export type MinimalContractMetadata = { chainId: number; priceResolver?: string; address: string };
export type Contracts = MinimalContractMetadata[];
export interface Address {
  address: string;
}
export interface Account {
  account: `0x${string}`;
}
export interface Enabled {
  enabled: boolean;
}

export type BaseContractProps = Address & ChainId & Partial<Account & Enabled>;

export type ConfigArgs = Partial<Parameters<typeof useContractWrite>[0]>;
