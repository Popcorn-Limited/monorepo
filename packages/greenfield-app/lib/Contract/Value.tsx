import type { Pop } from "../types";
import { useEffect } from "react";
import { BigNumber, constants } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { formatAndRoundBigNumber } from "@popcorn/utils";
import { withLoading } from "../utils";

interface Props {
  price?: BigNumber;
  balance?: BigNumber;
  decimals?: number;
}

const eth_call = (Component: Pop.FC<any>) =>
  function ValueWrapper({
    price,
    balance,
    decimals,
    status,
    callback,
  }: Props & { status?: "idle" | "error" | "success" | "loading" } & { callback?: (value?: BigNumber) => void }) {
    const value =
      balance && price
        ? balance
            .mul(price)
            .mul(parseUnits("1", decimals == 6 ? 12 : 0))
            .div(parseUnits("1", 18))
        : constants.Zero;

    useEffect(() => {
      if (status === "success" && value.gt(0)) {
        callback?.(value);
      }
    }, [status, value._hex, decimals, price]);

    return <Component {...{ price, balance, decimals, value, status }} />;
  };

export const Value = eth_call(withLoading(({ value }) => <>{"$" + formatAndRoundBigNumber(value, 18)}</>));
