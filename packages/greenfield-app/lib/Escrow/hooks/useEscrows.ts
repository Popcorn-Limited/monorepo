import { constants, BigNumber } from "ethers";
import { useContractRead } from "wagmi";
import { Pop, Escrow } from "../../types";
import { useEscrowIds } from "./useEscrowIds";
import { useClaimableBalances } from "./useClaimableBalances";

export const useEscrows: Pop.Hook<Escrow[]> = ({
  chainId,
  address,
  account,
  enabled,
}: { escrowIds?: string[] } & Pop.StdProps) => {
  const { data: escrowIds, status: escrowStatus } = useEscrowIds({
    chainId,
    address,
    account,
    enabled: !!chainId && !!address && !!account,
  });
  const { data: claimableBalances, status: claimableStatus } = useClaimableBalances({
    chainId,
    address,
    account,
    enabled: !!escrowIds && escrowIds?.length > 0,
    escrowIds,
  });

  const { data, status } = useContractRead({
    abi: ABI,
    address,
    functionName: "getEscrows(bytes32[])",
    chainId: Number(chainId),
    enabled: !!escrowIds && escrowIds.length > 0 && !!claimableBalances && claimableBalances.length > 0,
    scopeKey: `getEscrows:${chainId}:${address}:${account}`,
    args: [escrowIds],
    select: (data) => {
      return (data as [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, string][]).map((escrow, i) => {
        return {
          id: !!escrowIds && escrowIds.length > 0 ? escrowIds[i] : "",
          start: escrow[0],
          lastUpdateTime: escrow[1],
          end: escrow[2],
          initialBalance: escrow[2],
          balance: escrow[4],
          account: escrow[5],
          claimable: !!claimableBalances && claimableBalances.length > 0 ? claimableBalances[i] : constants.Zero,
          vesting: escrow[4].sub(
            !!claimableBalances && claimableBalances.length > 0 ? claimableBalances[i] : constants.Zero,
          ),
        };
      });
    },
  });
  return {
    data,
    status,
  } as Pop.HookResult<Escrow[]>;
};

const ABI = [
  "function getEscrows(bytes32[] calldata) external view returns ((uint256, uint256, uint256, uint256, uint256, address)[])",
  "function getEscrowIdsByUser(address) external view returns (bytes32[])",
];
