import { parseEther } from "ethers/lib/utils";
import { usePrice } from "../../Price/hooks/usePrice";
import { useTotalSupply } from "../../Erc20/hooks/useTotalSupply";
import { formatAndRoundBigNumber } from "@popcorn/utils/src/formatBigNumber";
import { BigNumber } from "ethers";
import { BigNumberWithFormatted, Pop } from "../../types";
import useNamedAccounts from "../../utils/hooks/useNamedAccounts";
import { useMultiStatus } from "../../utils/hooks/useMultiStatus";
import { useTvlResolver } from "./useTvlResolver";
import useLog from "../../utils/hooks/useLog";

interface Props {
  chainId: number;
  address?: string;
  priceResolver?: string;
  enabled?: boolean;
  resolver?: string;
}
export const useTvl: Pop.Hook<BigNumberWithFormatted> = ({ chainId, address, resolver, enabled }: Props) => {
  const [metadata] = useNamedAccounts(chainId.toString() as any, (!!address && [address]) || []);
  const _priceResolver = resolver || metadata?.priceResolver;
  const _tvlResolver = metadata?.tvlResolver;
  const _enabled = typeof enabled !== "undefined" ? !!enabled && !!chainId && !!address : !!chainId && !!address;
  const { data: price, status: priceStatus } = usePrice({
    address,
    chainId,
    resolver: _priceResolver,
    enabled: _enabled,
  });

  const { data: primaryBalance, status: primaryBalanceStatus } = useTotalSupply({
    address,
    chainId,
    enabled: !!_tvlResolver ? false : _enabled && priceStatus === "success",
  });

  const { data: secondaryBalance, status: secondaryBalanceStatus } = useTvlResolver({
    address,
    chainId,
    enabled: !!_tvlResolver ? _enabled && priceStatus === "success" : false,
  });

  const balance = !!_tvlResolver ? secondaryBalance : primaryBalance;

  console.log(price?.value)

  const tvl =
    price && (balance as BigNumber | undefined)
      ? price?.value?.mul(balance as unknown as BigNumber).div(parseEther("1"))
      : undefined;

  const status = useMultiStatus([priceStatus, !!_tvlResolver ? secondaryBalanceStatus : primaryBalanceStatus]);

  useLog({ address, chainId, price, balance, tvl, status }, [price, balance, tvl, status]);
  return {
    data: {
      value: tvl,
      formatted: tvl && price?.decimals ? formatAndRoundBigNumber(tvl, price?.decimals) : undefined,
    },
    status: status,
  } as Pop.HookResult<BigNumberWithFormatted>;
};
export default useTvl;
