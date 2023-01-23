import { useContractRead } from "wagmi";
import { BigNumber } from "ethers/lib/ethers";
import { Pop } from "../../types";
import { useNamedAccounts } from "../../utils";

export const useTotalSupply: Pop.Hook<BigNumber> = ({ address, chainId, enabled }) => {
  const [metadata] = useNamedAccounts(chainId as any, (!!address && [address]) || []);
  return useContractRead({
    address,
    chainId: Number(chainId),
    abi: ["function totalSupply() external view returns (uint256)"],
    functionName: "totalSupply",
    cacheOnBlock: true,
    scopeKey: `totalSupply:${chainId}:${address}`,
    enabled: typeof enabled !== "undefined" ? !!enabled && !!address && !!chainId : !!address && !!chainId,
    select: (result) => result as BigNumber,
  }) as Pop.HookResult<BigNumber>;
};
