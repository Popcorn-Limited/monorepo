import type { BigNumber } from "ethers";
import { useContractRead } from "wagmi";

/**
 * * NOTE: Fee - Sol struct
 * struct VaultFees {
 *   uint64 deposit;
 *   uint64 withdrawal;
 *   uint64 management;
 *   uint64 performance;
 * }
 */

type VaultFees = {
  deposit: BigNumber;
  withdrawal: BigNumber;
  management: BigNumber;
  performance: BigNumber;
};

function useVaultFees(vaultAddress: string = "") {
  const { data: fees = [] } = useContractRead({
    address: vaultAddress,
    enabled: vaultAddress.length > 0,
    abi: ["function fees() public view returns (uint64, uint64, uint64, uint64)"],
    functionName: "fees",
  });

  const [deposit, withdrawal, management, performance] = fees as BigNumber[];
  return { deposit, withdrawal, management, performance } as Partial<VaultFees>;
}

export default useVaultFees;
