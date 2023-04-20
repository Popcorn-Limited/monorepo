import { BigNumber } from "ethers";
import { usePrice } from "../Price";
import { withLoading } from "../utils/hocs/withLoading";
import { useTotalSupply } from "./hooks";
import { BigNumberWithFormatted, Pop } from "../types";

const eth_call = (Component: Pop.FC<BigNumberWithFormatted>) =>
  function ComponentWithBalance({
    ...props
  }: Pop.WithStdRenderProps<{
    price?: { value: BigNumber; decimals: number };
    balance?: BigNumberWithFormatted;
    status?: "loading" | "success" | "error" | "idle";
  }> & { resolver?: string; }) {
    const { data, status } = useTotalSupply(props);
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

export const TotalSupply = eth_call(withLoading(({ data }) => <>{data?.formatted || "0"}</>));

export default TotalSupply;
