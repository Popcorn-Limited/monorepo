import { useToken as _useToken } from "wagmi";
import { Pop } from "@popcorn/greenfield-app/lib/types";
import { useNamedAccounts } from "@popcorn/greenfield-app/lib/utils";
import useLog from "@popcorn/greenfield-app/lib/utils/hooks/useLog";

/**
 * useContractMetadata will return metadata from namedAccounts.json and merge it with fetched ERC20 metadata.
 * this will fail if the contract is not an ERC20, but if the contract has isERC20 set to false in named accounts
 * it will skip the ERC20 metadata fetch.
 *
 * todo: convert this to useToken hook instead so it's not confused to be used with non-erc20 contracts
 */
interface Props extends Pop.StdProps {
  alias?: string;
}
export interface ContractMetadata {
  address: string;
  chainId: string;
  symbol?: string;
  priceResolver?: string;
  apyResolver?: string;
  balanceResolver?: string;
  isERC20?: boolean;
  decimals?: number;
  name?: string;
  icons?: string[];
  alias?: string;
}
export const useContractMetadata: Pop.Hook<ContractMetadata> = ({ chainId, address, enabled, alias }: Props) => {
  const [metadata] = useNamedAccounts(chainId.toString() as any, (address && [address]) || []) as any;

  useLog({ metadata, address, chainId, enabled, alias });

  const { data, status } = _useToken({
    chainId: Number(chainId),
    address: address as any,
    scopeKey: `contract-metadata:${chainId}:${address}`,
    keepPreviousData: true,
    enabled: Boolean(address && chainId),
  });

  return { data: { ...data, ...metadata }, status };
};

export default useContractMetadata;
