import { useEffect } from "react";
import { BigNumber } from "ethers";
import { BigNumberWithFormatted, Pop } from "../types";
import { withLoading } from "../utils/hocs/withLoading";
import { useEscrowBalance, useEscrowIds } from "./hooks";
import { usePrice } from "../Price";
import { useMultiStatus } from "../utils/hooks/useMultiStatus";
import { useNetworth } from "../../context/Networth";
import { updateNetworth } from "../../reducers/networth/actions";

const eth_call =
  (Component: Pop.FC<BigNumberWithFormatted>) =>
  ({
    ...props
  }: Pop.StdProps & {
    render?: (props: {
      address?: string;
      chainId?: Number;
      price?: { value: BigNumber; decimals: number };
      balance?: BigNumberWithFormatted;
      status?: "loading" | "success" | "error" | "idle";
    }) => React.ReactElement;
  }) => {
    const { data: ids, status: idsStatus } = useEscrowIds(props);
    const { data, status: balanceStatus } = useEscrowBalance({
      ...props,
      enabled: idsStatus === "success",
      escrowIds: ids,
    });
    const { data: price, status: priceStatus } = usePrice({ ...props });
    const status = useMultiStatus([idsStatus, balanceStatus, priceStatus]);

    const { dispatch, state } = useNetworth();
    useEffect(() => {
      if (status === "success" && data?.value) {
        updateNetworth({
          key: "Escrow",
          value: data?.value,
          status,
        })(dispatch);
      }
    }, [status]);

    if (props.render) {
      return (
        <>
          {props.render({
            balance: data,
            price: price,
            status: status,
            ...props,
          })}
        </>
      );
    }
    return <Component {...props} data={data} status={balanceStatus} />;
  };

export const BalanceOf = eth_call(withLoading(({ data }) => <>{data?.formatted || "$0"}</>));

export default BalanceOf;
