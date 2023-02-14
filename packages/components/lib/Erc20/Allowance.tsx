import { BigNumber } from "ethers";
import { BigNumberWithFormatted } from "../../reducers/portfolio/reducer";
import { Pop } from "../types";
import { withLoading } from "../utils/hocs/withLoading";
import { withLogging } from "../utils/hocs/withLogging";
import { useAllowance } from "./hooks";

const eth_call = (Component: Pop.FC<BigNumberWithFormatted>) =>
  function ComponentWithAllowance({
    ...props
  }: Pop.WithStdRenderProps<{
    data?: BigNumberWithFormatted;
    status?: "loading" | "success" | "error" | "idle";
  }>) {
    const { data, status } = useAllowance(props);
    if (props.render) {
      return (
        <>
          {props.render({
            data,
            status,
            ...props,
          })}
        </>
      );
    }
    return <Component {...props} data={data} status={status} />;
  };

export const Allowance = eth_call(withLogging(withLoading(({ data }) => <>${data?.formatted || "0"}</>)));

export default Allowance;
