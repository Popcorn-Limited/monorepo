import { useContractRead } from "wagmi";

const useVaultTokenAddress = (address: string, chainId?: any) => {
  return useContractRead({
    abi: ["function asset() external view returns (address)"],
    address,
    functionName: "asset",
    chainId,
  }) as ReturnType<typeof useContractRead> & { data: string };
};

export default useVaultTokenAddress;
