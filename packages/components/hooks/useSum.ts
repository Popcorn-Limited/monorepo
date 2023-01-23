import { useEffect, useState } from "react";
import { BigNumber, constants } from "ethers";

export const useSum = ({
  expected,
}: {
  expected: number;
}): { loading: boolean; sum: BigNumber; add: (amount: BigNumber) => void; reset: () => void } => {
  const [sum, setSum] = useState(constants.Zero);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  const add = (amount?: BigNumber) => {
    if (!amount) return;
    setCount((count) => count + 1);
    setSum((sum) => sum.add(amount));
  };

  const reset = () => {
    setCount((prevState) => 0);
    setSum((prevState) => constants.Zero);
    if (expected > 0) setLoading((prevState) => true);
  };

  useEffect(() => {
    const id = setTimeout(() => {
      setLoading(false);
    }, 100000);
    return () => {
      clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    if (count >= expected) {
      setLoading(false);
    }
  }, [count]);

  return { loading, sum, add, reset };
};
export default useSum;
