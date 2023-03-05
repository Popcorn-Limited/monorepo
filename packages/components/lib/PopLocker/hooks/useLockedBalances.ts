import { useNamedAccounts } from "@popcorn/components/lib/utils";
import { LockedBalance, Pop } from "../../types";
import { Address, useContractRead } from "wagmi";
import { BigNumber } from "ethers";

export const useLockedBalances: Pop.Hook<{
  total: BigNumber;
  unlockable: BigNumber;
  locked: BigNumber;
  lockData: LockedBalance[];
}> = ({ chainId, address, account, enabled }: Pop.StdProps) => {
  const [metadata] = useNamedAccounts(chainId as any, (!!address && [address]) || []);
  const _apyResolver = metadata?.apyResolver === "convex";

  const _enabled =
    typeof enabled === "boolean"
      ? !!enabled && !!account && !!address && !!chainId && _apyResolver
      : !!account && !!address && !!chainId && _apyResolver;

  return useContractRead({
    enabled: _enabled,
    scopeKey: `staking:convex:lockedBalances:${chainId}:${address}:${account}`,
    cacheOnBlock: true,
    address: (!!address && address) || "",
    chainId: Number(chainId),
    abi: [
      {
        inputs: [
          {
            internalType: "address",
            name: "_user",
            type: "address",
          },
        ],
        name: "lockedBalances",
        outputs: [
          {
            internalType: "uint256",
            name: "total",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "unlockable",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "locked",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "uint112",
                name: "amount",
                type: "uint112",
              },
              {
                internalType: "uint112",
                name: "boosted",
                type: "uint112",
              },
              {
                internalType: "uint32",
                name: "unlockTime",
                type: "uint32",
              },
            ],
            internalType: "struct PopLocker.LockedBalance[]",
            name: "lockData",
            type: "tuple[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "lockedBalances",
    args: [account as Address],
  }) as any as Pop.HookResult<{
    total: BigNumber;
    unlockable: BigNumber;
    locked: BigNumber;
    lockData: LockedBalance[];
  }>;
};
