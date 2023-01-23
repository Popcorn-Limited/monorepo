import { useEffect, useState, useMemo, useRef } from "react";
import { BigNumber, constants } from "ethers";
import useLog from "@popcorn/components/lib/utils/hooks/useLog";

export const useSum = ({
  expected,
  timeout,
  enabled,
}: {
  expected?: number;
  timeout?: number; // in ms
  enabled?: boolean; // undefined is true
}): { loading: boolean; sum?: BigNumber; add: (amount: BigNumber) => void; reset: () => void } => {
  const _enabled = enabled === undefined ? true && !!expected : enabled && !!expected;
  const _expected = expected || 0;

  const [loading, setLoading] = useState(!!_expected);
  const count = useRef(0);
  const sum = useRef(constants.Zero);

  const add = (amount?: BigNumber) => {
    if (!_enabled) return;
    if (!amount || !!_expected == false) return;
    if (typeof _expected !== "number") return;
    count.current++;
    sum.current = sum.current.add(amount);
  };

  useEffect(() => {
    if (!!enabled && !!_expected && count.current >= _expected) {
      setLoading(false);
    }
  }, [_expected, count.current, _enabled]);

  const reset = () => {
    count.current = 0;
    sum.current = constants.Zero;
    setLoading((prevState) => true);
  };

  useEffect(() => {
    if (!_enabled && !!timeout) return;
    const id = setTimeout(() => {
      setLoading(false);
    }, timeout);
    return () => {
      clearTimeout(id);
    };
  }, [_enabled]);

  const finished = useMemo(() => {
    return (loading && !!_expected && false) || (!loading && !!_expected && _expected >= count.current);
  }, [_expected, count, loading]);

  const response = useMemo(() => {
    return { loading, sum: sum.current, add, reset };
  }, [_enabled, finished, loading]);

  useLog({ response, _enabled, finished, loading, _expected, count: count.current }, [
    enabled,
    finished,
    loading,
    expected,
    count,
  ]);
  return response;
};
export default useSum;
