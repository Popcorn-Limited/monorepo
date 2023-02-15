import { BigNumber } from "ethers";
import { useEffect } from "react";
import { usePrice } from "../Price";
import { BigNumberWithFormatted, Pop } from "../types";
import { useMultiStatus } from "../utils";
import { withBigNumberFormatting } from "../utils/hocs/withBigNumberFormatting";
import { withLoading } from "../utils/hocs/withLoading";
import { useClaimableToken } from "../utils/hooks/useClaimableToken";
import { useClaimableBalance } from "./hooks/useClaimableBalance";

const eth_call =
  (Component: Pop.FC<{ data?: BigNumberWithFormatted }>) =>
  ({
    ...props
  }: Pop.StdProps & {
    render?: (props: {
      price?: BigNumber;
      address?: string;
      chainId?: Number;
      balance?: BigNumberWithFormatted;
      decimals?: number;
      status?: Pop.HookResult["status"];
    }) => React.ReactElement;
  } & { callback?: (value?: BigNumber) => void }) => {
    const { data: token, status: claimableTokenStatus } = useClaimableToken(props);
    const { data, status: balanceStatus } = useClaimableBalance(props);
    const { data: price } = usePrice({ ...props, address: token });

    const status = useMultiStatus([claimableTokenStatus, balanceStatus]);

    useEffect(() => {
      if (status === "success" && data?.value.gt(0)) {
        props.callback?.(data.value);
      }
    }, [status, data]);

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

export const ClaimableBalanceOf = eth_call(withLoading(({ data }) => <>{data?.formatted}</>));

export default ClaimableBalanceOf;
