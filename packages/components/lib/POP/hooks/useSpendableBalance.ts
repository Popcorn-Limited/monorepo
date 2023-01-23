import { BigNumber } from "ethers";
import { useContractRead } from "wagmi";
import { Pop } from "../../types";

export const useSpendableBalance: Pop.Hook<BigNumber> = ({ address, account, chainId, enabled }) => {
  const _enabled = !!address && !!account && Number(chainId) === 1;

  return useContractRead({
    abi: ["function spendableBalanceOf(address) view returns (uint256)"],
    address,
    functionName: "spendableBalanceOf",
    args: [account],
    cacheOnBlock: true,
    scopeKey: `useSpendableBalance:${chainId}:${address}:${account}`,
    chainId: Number(chainId),
    enabled: typeof enabled !== "undefined" ? !!enabled && _enabled : _enabled,
  }) as Pop.HookResult<BigNumber>;
};
export default useSpendableBalance;
