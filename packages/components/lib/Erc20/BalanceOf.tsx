import { BigNumber } from "ethers";
import { BigNumberWithFormatted } from "../../reducers/portfolio/reducer";
import { usePrice } from "../Price";
import { Pop } from "../types";
import { withLoading } from "../utils/hocs/withLoading";
import { useBalanceOf } from "./hooks";

const eth_call = (Component: Pop.FC<BigNumberWithFormatted>) =>
  function ComponentWithBalance({
    ...props
  }: Pop.WithStdRenderProps<{
    price?: { value: BigNumber; decimals: number };
    balance?: BigNumberWithFormatted;
    status?: "loading" | "success" | "error" | "idle";
  }>) {
    const { data, status } = useBalanceOf(props);
    const { data: price } = usePrice({ ...props });
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
    return <Component {...props} data={data} status={status} />;
  };

export const BalanceOf = eth_call(withLoading(({ data }) => <>{data?.formatted || "0"}</>));

export default BalanceOf;
