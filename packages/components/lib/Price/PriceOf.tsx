import { usePrice } from "./hooks/usePrice";
import { BigNumberWithFormatted, Pop } from "../types";
import withLoading from "../utils/hocs/withLoading";
import { BigNumber } from "ethers";

const eth_call =
  (Component: Pop.FC<BigNumberWithFormatted>) =>
  ({
    ...props
  }: Pop.BaseContractProps & {
    withPrice?: (price: { price?: BigNumber; address?: string; chainId?: Number }) => React.ReactElement;
  }) => {
    const { data, status } = usePrice({ ...props });

    if (props.withPrice) {
      return <>{props.withPrice({ price: data?.value, address: props.address, chainId: props.chainId })}</>;
    }

    return <Component {...props} data={data} status={status} />;
  };

export const PriceOf = eth_call(withLoading(({ data }) => <>${data?.formatted || "0"}</>));

export default PriceOf;
