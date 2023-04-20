import useTvl from "./hooks/useTvl";
import { withLoading } from "../utils/hocs/withLoading";
import { BigNumberWithFormatted, Pop } from "../types";

const eth_call = (Component: Pop.FC<BigNumberWithFormatted>) =>
  function TvlWithLoading({ ...props }: Pop.BaseContractProps & { resolver?: string }) {
    const { data, status } = useTvl(props);
    return <Component {...props} data={data} status={status} />;
  };

export const Tvl = eth_call(withLoading(({ data }) => <>${data?.formatted}</>));

export default Tvl;
