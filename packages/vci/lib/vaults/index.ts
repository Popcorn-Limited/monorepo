import type { Tuple } from "@/lib/@types/shared";
import type { BigNumberish } from "ethers";
import { useTypedWriteCall } from "@/lib/wagmi";
import { STRUCT_INIT_PARAMS, STRUCT_DEPLOYMENT_ARGS, STRUCT_VAULT_METADATA } from "@/lib/vaults/constants";

export const ABI_VAULT_CONTROLLER = [
  `function deployVault(${STRUCT_INIT_PARAMS},${STRUCT_DEPLOYMENT_ARGS},${STRUCT_DEPLOYMENT_ARGS},address,bytes,${STRUCT_VAULT_METADATA},uint256) external returns (address vault)`,
];

export const useDeployVault = (args: VaultDeployProps) => {
  return useTypedWriteCall({
    abi: [ABI_VAULT_CONTROLLER],
    functionName: "deployVault",
    args,
  });
};

/**
 * @TODO Use new wagmi ABI parser for human readable
 * @see https://twitter.com/wagmi_sh/status/1631017966505541633
 */
type VaultDeployProps = [
  [string, string, [BigNumberish, BigNumberish, BigNumberish, BigNumberish], string, string],
  [any, any],
  [any, any],
  string,
  any,
  [string, string, string, string, Tuple<string, 8>, string, BigNumberish],
  BigNumberish,
];
