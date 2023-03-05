import { BigNumber, constants } from "ethers";
import { useMemo } from "react";

function useVariadicSum(...bns: Array<BigNumber | undefined>): BigNumber {
  return useMemo(() => bns.reduce((total, current) => total!.add(current || 0), constants.Zero) as any, [bns]);
}

export default useVariadicSum;
