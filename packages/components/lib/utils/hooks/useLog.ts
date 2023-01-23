import { useEffect, useMemo } from "react";

function useLog(msg, ...deps) {
  // @ts-ignore
  const callerFunctionName = new Error()?.stack.split("\n")[2].trim().split(" ")[1];
  msg = { ...msg, __useLogCaller: callerFunctionName };

  const enabled = useMemo(() => {
    return process.env.NODE_ENV === "development" && process.env.USE_LOG;
  }, []);

  useEffect(
    () => {
      !!enabled && console.log({ ...msg });
    },
    deps ? deps : [...msg],
  );
}

export default useLog;
