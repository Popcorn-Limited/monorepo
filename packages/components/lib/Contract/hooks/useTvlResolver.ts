import { BigNumber } from "ethers";
import { useContractRead } from "wagmi";
import { Pop } from "../../types";
import { useNamedAccounts } from "../../utils";
import useLog from "../../utils/hooks/useLog";
import { useMultiStatus } from "../../utils/hooks/useMultiStatus";

export const useTvlResolver: Pop.Hook<BigNumber> = ({ address, chainId, enabled }) => {
  const [metadata] = useNamedAccounts(chainId as any, (!!address && [address]) || []);

  const _tvlResolver = metadata?.tvlResolver;

  const _enabled = !!_tvlResolver
    ? typeof enabled !== "undefined"
      ? !!enabled && !!address && !!chainId
      : !!address && !!chainId
    : !!address && !!chainId;

  const { data: token, status: tokenStatus } = useContractRead({
    address,
    chainId: Number(chainId),
    abi: _tvlResolver?.tokenFunctionAbi,
    functionName: _tvlResolver?.tokenFunction,
    cacheOnBlock: true,
    scopeKey: `getToken:${chainId}:${address}`,
    enabled: _enabled,
    select: (result) => result as string,
  });

  const { data: balance, status: balanceStatus } = useContractRead({
    address: token as string,
    chainId: Number(chainId),
    abi: ["function balanceOf(address) external view returns (uint256)"],
    functionName: "balanceOf",
    args: [address],
    cacheOnBlock: true,
    scopeKey: `balanceOf:${chainId}:${token}:${address}`,
    enabled: _enabled && tokenStatus === "success",
    select: (result) => result as BigNumber,
  });

  const status = useMultiStatus([tokenStatus, balanceStatus]);

  useLog({ token, balance, _tvlResolver, metadata, balanceStatus, tokenStatus, status }, [
    token,
    balance,
    _tvlResolver,
    metadata,
    balanceStatus,
    tokenStatus,
    status,
  ]);

  return {
    data: balance,
    status,
  } as Pop.HookResult<BigNumber>;
};
