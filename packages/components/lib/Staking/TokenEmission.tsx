import type { BigNumberWithFormatted, Pop } from "../types";
import { withLoading } from "../utils/hocs/withLoading";
import { useTokenEmission } from "./hooks/useTokenEmission";

const eth_call = (Component: Pop.FC<BigNumberWithFormatted>) =>
  function ComponentWithBalance({
    ...props
  }: Pop.WithStdRenderProps<{
    balance?: BigNumberWithFormatted;
    status?: "loading" | "success" | "error" | "idle";
  }>) {
    const { data, status } = useTokenEmission({
      chainId: props.chainId,
      address: props.address,
    });
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

export const TokenEmission = eth_call(withLoading(({ data }) => <>{data?.formatted || "0"}</>));

export default TokenEmission;
