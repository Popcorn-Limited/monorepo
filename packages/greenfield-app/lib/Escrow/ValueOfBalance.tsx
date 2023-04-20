import { Pop } from "lib/types";
import { BigNumberWithFormatted } from "../../reducers/portfolio/reducer";
import { useBalanceValue } from "../Contract/hooks/useBalanceValue";
import { usePrice } from "../Price/hooks";
import { withLoading } from "../utils/hocs/withLoading";
import { useEscrowBalance, useEscrowIds } from "./hooks";

const eth_call =
  (Component: Pop.FC<BigNumberWithFormatted>) =>
  ({ ...props }: Pop.BaseContractProps) => {
    const { data: ids, status: idsStatus } = useEscrowIds(props);
    const { data: balance, status: balanceStatus } = useEscrowBalance({
      ...props,
      enabled: idsStatus === "success",
      escrowIds: ids,
    });
    const { data: price, status: priceStatus } = usePrice(props);
    const { data, status } = useBalanceValue({ ...props, balance: balance?.value, price: price?.value });

    return (
      <Component
        {...props}
        data={data}
        status={[balanceStatus, priceStatus].includes("loading") ? "loading" : status == "success" ? "success" : "idle"}
      />
    );
  };

export const ValueOfBalance = eth_call(withLoading(({ data }) => <>${data?.formatted || "0"}</>));

export default ValueOfBalance;
