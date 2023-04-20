import { BigNumber } from "ethers";
import { usePrice } from "../Price";
import { BigNumberWithFormatted, Pop } from "../types";
import { withLoading } from "../utils/hocs/withLoading";
import { useEscrowIds } from "./hooks";
import { useClaimableBalance } from "./hooks/useClaimableBalance";
import { useClaimableToken } from "../utils/hooks/useClaimableToken";
import { useMultiStatus } from "../utils";

interface RenderProps extends Pop.StdProps {
  price?: { value: BigNumber; decimals: number };
  balance?: BigNumberWithFormatted;
  status?: "loading" | "success" | "error" | "idle";
}

const eth_call = (Component: Pop.FC<BigNumberWithFormatted>) =>
  function ClaimableBalance({ ...props }: Pop.WithStdRenderProps<RenderProps>) {
    const { data: token } = useClaimableToken({ ...props });
    const { data: price, status: priceStatus } = usePrice({ ...props, address: token });
    const { data: ids, status: idsStatus } = useEscrowIds({ ...props });
    const { data: claimableBalance, status: balanceStatus } = useClaimableBalance({
      ...props,
      enabled: idsStatus === "success",
      escrowIds: ids,
    });
    const status = useMultiStatus([balanceStatus, priceStatus]);
    if (props.render) {
      return (
        <>
          {props.render({
            price: price,
            balance: claimableBalance,
            status,
            ...props,
          })}
        </>
      );
    }
    return <Component {...props} data={claimableBalance} status={balanceStatus} />;
  };

export const ClaimableBalanceOf = eth_call(withLoading(({ data }) => <>{data?.formatted}</>));

export default ClaimableBalanceOf;
