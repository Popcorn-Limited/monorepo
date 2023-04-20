/* eslint-disable react/display-name */
import { BigNumber, constants } from "ethers";
import { usePrice } from "../Price";
import { BigNumberWithFormatted, Pop } from "../types";
import { withLoading } from "../utils/hocs/withLoading";
import { useEscrowIds, useEscrowBalance } from "./hooks";
import { useClaimableBalance } from "./hooks/useClaimableBalance";
import { useClaimableToken } from "../utils/hooks/useClaimableToken";
import { useMultiStatus } from "../utils";
import { useMemo } from "react";
import useLog from "@popcorn/greenfield-app/lib/utils/hooks/useLog";

const eth_call =
  (Component: Pop.FC<BigNumberWithFormatted>) =>
  ({
    ...props
  }: Pop.StdProps & {
    render?: (
      props: {
        price?: { value: BigNumber; decimals: number };
        balance?: BigNumberWithFormatted;
        status?: "loading" | "success" | "error" | "idle";
      } & Pop.StdProps,
    ) => React.ReactElement;
  }) => {
    const { data: token } = useClaimableToken({ ...props });
    const { data: price, status: priceStatus } = usePrice({ ...props, address: token });
    const { data: ids, status: idsStatus } = useEscrowIds({ ...props });

    const { data: claimableBalance, status: claimableBalanceStatus } = useClaimableBalance({
      ...props,
      enabled: idsStatus === "success",
      escrowIds: ids,
    });

    const { data: balance, status: balanceStatus } = useEscrowBalance({
      ...props,
      enabled: idsStatus === "success",
      escrowIds: ids,
    });

    const vestingBalance = useMemo(() => {
      return {
        value: (balance?.value || constants.Zero).sub(claimableBalance?.value || constants.Zero),
        formatted: balance?.formatted,
      };
    }, [balance, claimableBalance]);

    const status = useMultiStatus([balanceStatus, claimableBalanceStatus, priceStatus]);
    if (props.render) {
      return (
        <>
          {props.render({
            price: price,
            balance: vestingBalance,
            status,
            ...props,
          })}
        </>
      );
    }
    return <Component {...props} data={vestingBalance} status={balanceStatus} />;
  };

export const VestingBalanceOf = eth_call(withLoading(({ data }) => <>{data?.formatted}</>));

export default VestingBalanceOf;
