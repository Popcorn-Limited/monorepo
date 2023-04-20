import { withLoading } from "../utils/hocs/withLoading";
import { useTotalAssets } from "./hooks";
import { BigNumberWithFormatted, Pop } from "../types";

const eth_call = (Component: Pop.FC<BigNumberWithFormatted>) =>
  function ComponentWithBalance({
    ...props
  }: Pop.WithStdRenderProps<{
    balance?: BigNumberWithFormatted;
    status?: "loading" | "success" | "error" | "idle";
  }> & { resolver?: string; }) {
    const { data, status } = useTotalAssets(props);

    if (props.render) {
      return (
        <>
          {props.render({
            balance: data,
            status: status,
            ...props,
          })}
        </>
      );
    }
    return <Component {...props} data={data} status={status} />;
  };

export const TotalAssets = eth_call(withLoading(({ data }) => <>{data?.formatted || "0"}</>));

export default TotalAssets;
