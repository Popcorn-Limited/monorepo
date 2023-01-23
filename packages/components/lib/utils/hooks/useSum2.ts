import { useEffect, useState, useRef, useCallback } from "react";
import { BigNumber, constants } from "ethers";
import useLog from "@popcorn/components/lib/utils/hooks/useLog";
import { formatAndRoundBigNumber } from "@popcorn/utils";

export const useSum2 = ({
  expected: _expected,
  timeout,
  decimals,
  enabled: _enabled,
}: {
  expected?: number;
  timeout?: number; // in ms
  enabled?: boolean; // undefined is true
  decimals?: number;
}): {
  loading: boolean;
  count: number;
  sum?: BigNumber;
  add: ({ key, amount }: { key: string; amount: BigNumber }) => void;
  reset: () => void;
} => {
  const enabled = _enabled === undefined ? true && !!_expected : _enabled && !!_expected;
  const expected = _expected || 0;

  const index = useRef<{ [key: string]: BigNumber }>({});
  const [loading, setLoading] = useState(!!expected);
  const [sum, setSum] = useState<BigNumber | undefined>();
  const [count, setCount] = useState(0);

  useLog({
    enabled,
    expected,
    loading,
    count: Object.values(index.current).length,
    sum: Object.values(index.current).reduce((acc, curr) => acc.add(curr), constants.Zero),
    sumFormatted: formatAndRoundBigNumber(
      Object.values(index.current).reduce((acc, curr) => acc.add(curr), constants.Zero),
      decimals || 18,
    ),
    index: index.current,
  });

  const getIndexLength = useCallback(() => Object.values(index.current).length, [index.current]);

  useEffect(() => {
    console.log("useSum2", {
      enabled,
      expected,
      loading,
      count: getIndexLength(),
      sum: formatAndRoundBigNumber(doSum(), decimals || 18),
      index: index.current,
    });
    const check = () => {
      if (!!enabled && !!expected && getIndexLength() >= expected && loading === true) {
        console.log("setting loading to false", loading);
        setLoading(false);
        setSum(doSum());
      }
    };
    check();
  }, [expected, index.current, enabled, loading, count]);

  const doSum = () => {
    return Object.values(index.current).reduce((acc: BigNumber, val: BigNumber) => {
      return acc.add(val);
    }, constants.Zero);
  };

  const add = ({ key, amount }) => {
    if (amount) {
      index.current[key] = amount;
      setCount((prev) => prev + 1);
    }
  };

  const reset = () => {
    index.current = {};
    setLoading((prevState) => true);
    setCount((prev) => 0);
    setSum(undefined);
  };

  return { loading, sum, add, reset, count: getIndexLength() };
};
export default useSum2;
