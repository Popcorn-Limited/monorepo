import type { useContractRead } from "wagmi";
import { useEffect, useRef, useState } from "react";

export type UseContractReadReturn = ReturnType<typeof useContractRead>;

export const REFETCH_TIME_IN_MS = 15_000;
export const MAX_RETRY_COUNT = 10;
export const useConsistentRepolling = <T extends UseContractReadReturn = UseContractReadReturn>(wagmiReadCall: T) => {
  const [count, setCount] = useState(0);
  const timer = useRef<any>();
  const dataTracker = useRef<{
    isSameTimes: number;
    data: any;
  }>({
    isSameTimes: 0,
    data: undefined,
  });

  const POLLING_TIME_OUT = Math.min(
    REFETCH_TIME_IN_MS + dataTracker.current.isSameTimes * 700,
    42_000, // Max refetch time to 42s
  );

  useEffect(() => {
    console.debug(`POLLING_TIME_OUT::${POLLING_TIME_OUT}`);

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (wagmiReadCall.internal.failureCount < MAX_RETRY_COUNT) {
        if (wagmiReadCall.isLoading) return;
        // no execute if enabled=false

        wagmiReadCall.refetch({
          type: "active",
          throwOnError: false,
          exact: true,
          fetchStatus: "idle",
        });

        const isSameData = JSON.stringify(dataTracker.current.data) == JSON.stringify(wagmiReadCall.data);

        if (isSameData) {
          dataTracker.current.isSameTimes += 1;
        } else {
          dataTracker.current.isSameTimes = wagmiReadCall.isSuccess ? 2 : 0;
          // if failed refetch at ZERO else wait a lil more
        }

        dataTracker.current.data = wagmiReadCall.data;
      }
      setCount((n) => n + 1);
    }, POLLING_TIME_OUT);

    return () => clearTimeout(timer.current);
  }, [count, wagmiReadCall.isIdle]);

  return wagmiReadCall;
};

export const withCachedResults =
  (muticallSize = 1) =>
  (prev: Array<any> = [], next: Array<any> = []) => {
    const responseArr = [...new Array(muticallSize)];
    // useContractReads cache old response if non falsy value
    return responseArr.map((_, idx) => next[idx] || prev[idx]) as any;
  };

export const withCachedSingleResult = (prev: any, next: any) => next || prev;
