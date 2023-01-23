/* eslint-disable react/display-name */
import { BigNumber } from "ethers";
import { useMemo } from "react";
import { formatAndRoundBigNumber } from "@popcorn/utils/src/formatBigNumber";
import { withLoading } from "../utils";
import { Pop } from "../types";

interface FormattedBigNumerProps {
  formatted?: string;
  value?: BigNumber;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  status?: Pop.HookResult["status"];
}

export const Hoc =
  (Component: React.FC<FormattedBigNumerProps>) =>
  ({ value, decimals, suffix, prefix, ...props }: FormattedBigNumerProps) => {
    const formatted = useMemo(() => {
      return (value && formatAndRoundBigNumber(value, decimals || 18)) || "0";
    }, [value, decimals]);

    let _prefix = prefix ? prefix : "";
    let _suffix = suffix ? suffix : "";
    return <Component {...props} formatted={_prefix + formatted + _suffix} />;
  };
export const FormattedBigNumber = Hoc(withLoading(({ formatted }) => <>{formatted}</>));

export default FormattedBigNumber;
