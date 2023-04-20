import type { ContractWriteArgs } from "@popcorn/greenfield-app/lib/types";
import type { BigNumber } from "ethers";
import { constants } from "ethers";
import { Address, useContractWrite, usePrepareContractWrite } from "wagmi";
import { useNamedAccounts } from "@popcorn/greenfield-app/lib/utils/hooks";
import { ChainId } from "@popcorn/greenfield-app/lib/utils/connectors";
import { useTypedReadCall } from "./wagmi";

// TODO: remove hard-coded gas
// NOTE: Fails - out of gas from anvil local if lower that this
const GAS_LIMIT = constants.Zero.add(1000000);

export const useDepositVaultBalance = (
  vaultAddress: string,
  chainId: ChainId,
  balance: BigNumber,
  wagmiConfig?: ContractWriteArgs,
) => {
  const { config } = usePrepareContractWrite({
    address: vaultAddress as Address,
    abi: ["function deposit(uint256 assets) public returns (uint256)"],
    functionName: "deposit",
    args: [balance],
    chainId: Number(chainId),
    overrides:
      chainId === ChainId.Localhost
        ? {
          gasLimit: GAS_LIMIT,
        }
        : {},
  });

  return useContractWrite({
    ...(wagmiConfig as any),
    ...config,
  });
};

export const useRedeemVaultBalance = (
  vaultAddress: string,
  chainId: ChainId,
  balance: BigNumber,
  wagmiConfig?: ContractWriteArgs,
) => {
  const { config } = usePrepareContractWrite({
    address: vaultAddress as Address,
    abi: ["function redeem(uint256 shares) public returns (uint256)"],
    functionName: "redeem",
    args: [balance],
    chainId: Number(chainId),
    overrides:
      chainId === ChainId.Localhost
        ? {
          gasLimit: GAS_LIMIT,
        }
        : {},
  });

  return useContractWrite({
    ...(wagmiConfig as any),
    ...config,
  });
};

export const useVaultRegistry = (chainId: any) => {
  const [registry] = useNamedAccounts(chainId, ["vaultRegistry"]);
  return registry;
};

/**
 * Pulls vault addresses from `allVaults` in VaulRegistry
 */
export const useAllVaults = (chainId?: ChainId, config?: ContractWriteArgs) => {
  const registry = useVaultRegistry(chainId);

  return useTypedReadCall<string[]>({
    address: registry?.address as Address,
    abi: ["function getRegisteredAddresses() external view returns (address[])"],
    functionName: "getRegisteredAddresses",
    chainId,
    ...config,
  });
};
