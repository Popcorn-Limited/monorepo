import { ChainId } from "@popcorn/utils";
import type { BigNumber } from "ethers";
import { constants } from "ethers";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

type ConfigArgs = Partial<Parameters<typeof useContractWrite>[0]>;

// TODO: remove hard-coded gas
// NOTE: Fails - out of gas from anvil local if lower that this
const GAS_LIMIT = constants.Zero.add(1000000);

export const useApproveVaultBalance = (
  vaultAddress: string,
  assetAddress: string,
  chainId: ChainId,
  wagmiConfig?: ConfigArgs,
) => {
  const { config } = usePrepareContractWrite({
    address: assetAddress,
    abi: ["function approve(address spender, uint256 amount) public"],
    functionName: "approve",
    args: [vaultAddress, constants.MaxUint256],
    chainId: Number(chainId),
  });

  return useContractWrite({
    ...(wagmiConfig as any),
    ...config,
  });
};

export const useDepositVaultBalance = (
  vaultAddress: string,
  chainId: ChainId,
  balance: BigNumber,
  wagmiConfig?: ConfigArgs,
) => {
  const { config } = usePrepareContractWrite({
    address: vaultAddress,
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
  wagmiConfig?: ConfigArgs,
) => {
  const { config } = usePrepareContractWrite({
    address: vaultAddress,
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
