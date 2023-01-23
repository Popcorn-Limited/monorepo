import { BigNumber } from "ethers";
import { usePrice } from "../Price";
import { Pop } from "../types";
import { useMultiStatus } from "../utils";
import { withBigNumberFormatting } from "../utils/hocs/withBigNumberFormatting";
import { withLoading } from "../utils/hocs/withLoading";
import { useClaimableToken } from "../utils/hooks/useClaimableToken";
import { useClaimableBalance } from "./hooks/useClaimableBalance";

const eth_call =
  (Component: Pop.FC<{ data?: BigNumber }>) =>
  ({
    ...props
  }: Pop.StdProps & {
    render?: (props: {
      price?: BigNumber;
      address?: string;
      chainId?: Number;
      balance?: BigNumber;
      decimals?: number;
      status?: Pop.HookResult["status"];
    }) => React.ReactElement;
  }) => {
    const { data: token, status: claimableTokenStatus } = useClaimableToken(props);
    const { data, status: balanceStatus } = useClaimableBalance(props);
    const { data: price } = usePrice({ ...props, address: token });

    const status = useMultiStatus([claimableTokenStatus, balanceStatus]);
    if (props.render) {
      return (
        <>
          {props.render({
            price: price?.value,
            address: token,
            chainId: props.chainId,
            balance: data,
            status,
            decimals: price?.decimals,
          })}
        </>
      );
    }
    return <Component {...props} data={data} status={status} />;
  };

export const ClaimableBalanceOf = eth_call(withBigNumberFormatting(withLoading(({ data }) => <>{data?.formatted}</>)));

export default ClaimableBalanceOf;
