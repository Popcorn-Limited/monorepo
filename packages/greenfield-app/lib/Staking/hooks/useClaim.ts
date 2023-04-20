import { ChainId } from "@popcorn/greenfield-app/lib/utils/connectors";
import { useNamedAccounts } from "@popcorn/greenfield-app/lib/utils";
import { Address, useContractWrite, usePrepareContractWrite } from "wagmi";

type ConfigArgs = Partial<Parameters<typeof useContractWrite>[0]>;

export const useClaim = (address: Address, chainId: ChainId, account?: Address, wagmiConfig?: ConfigArgs) => {
  const [metadata] = useNamedAccounts(chainId as any, (!!address && [address]) || []);
  const _apyResolver = ["synthetix", "convex"].includes(metadata?.apyResolver);

  const writeConfig = {
    address,
    abi: [
      metadata?.apyResolver === "synthetix"
        ? "function getReward() external"
        : "function getReward(address _account) external",
    ],
    functionName: "getReward",
    args: [metadata?.apyResolver === "synthetix" ? null : account],
    chainId: Number(chainId),
    enabled: !!address && !!chainId && _apyResolver && metadata?.apyResolver === "synthetix" ? true : !!account,
  };

  const { config } = usePrepareContractWrite(writeConfig);

  return useContractWrite({
    ...(wagmiConfig as any),
    ...config,
  });
};
