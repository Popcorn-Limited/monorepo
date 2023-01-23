import { BigNumber } from "ethers";
import { formatAndRoundBigNumber } from "@popcorn/utils";
import { Pop, BigNumberWithFormatted } from "../../types";

export const withBigNumberFormatting =
  (Component: Pop.FC<BigNumberWithFormatted>) =>
  ({ ...props }: Pop.StdProps & { data?: BigNumber }) => {
    return (
      <Component
        {...props}
        data={{
          value: props.data,
          formatted: props.data ? formatAndRoundBigNumber(props.data, 18) : undefined,
        }}
      />
    );
  };
