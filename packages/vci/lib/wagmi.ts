import { useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";

export type ContractWriteArgs = Partial<Parameters<typeof useContractWrite>[0]>;

export const useTypedReadCall = <TypeData>(config: ContractWriteArgs) => {
  const chainId = config?.chainId;
  return useContractRead({
    ...(config as any),
    chainId: chainId ? Number(chainId) : chainId,
  }) as ReturnType<typeof useContractRead> & { data?: TypeData };
};

export const useTypedWriteCall = <TypeData>(config: ContractWriteArgs) => {
  const chainId = config?.chainId;
  const { config: preparedConfig } = usePrepareContractWrite({
    ...(config as any),
    chainId: chainId ? Number(chainId) : chainId,
  });

  return useContractWrite({
    ...preparedConfig,
    ...(config as any),
  }) as ReturnType<typeof useContractWrite> & { data?: TypeData };
};
