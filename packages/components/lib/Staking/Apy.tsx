import { BigNumberWithFormatted, Pop } from "../types";
import { withLoading } from "../utils/hocs/withLoading";
import { useApy } from "./hooks";

const eth_call = (Component: Pop.FC<BigNumberWithFormatted>) =>
  function ApyWithLoading({
    ...props
  }: Pop.BaseContractProps & {
    render?: (props: { data?: BigNumberWithFormatted; status }) => React.ReactElement<any>;
  }) {
    const { data, status } = useApy({ ...props });
    if (props.render) {
      return (
        <>
          {props.render({
            data: data,
            status: status,
            ...props,
          })}
        </>
      );
    }
    return <Component {...props} data={data} status={status} />;
  };

export const Apy = eth_call(withLoading(({ data }) => <>{data?.formatted || "0"}</>));

export default Apy;
