import { BigNumberWithFormatted } from "../../reducers/portfolio/reducer";
import { useBalanceValue } from "../Contract/hooks/useBalanceValue";
import { usePrice } from "../Price/hooks";
import { Pop } from "../types";
import { withLoading } from "../utils/hocs/withLoading";
import { useBalanceOf } from "./hooks";
import { useMultiStatus } from "../utils/hooks/useMultiStatus";

const eth_call = (Component: Pop.FC<BigNumberWithFormatted>) =>
  function ComponentWithValueOfBalance({ ...props }: Pop.BaseContractProps) {
    const { data: balance, status: balanceStatus } = useBalanceOf(props);
    const { data: price, status: priceStatus } = usePrice(props);
    const { data, status: valueStatus } = useBalanceValue({ ...props, balance: balance?.value, price: price?.value });
    const status = useMultiStatus([balanceStatus, priceStatus, valueStatus]);

    return <Component {...props} data={data} status={status} />;
  };

export const ValueOfBalance = eth_call(withLoading(({ data }) => <>${data?.formatted || "0"}</>));

export default ValueOfBalance;
