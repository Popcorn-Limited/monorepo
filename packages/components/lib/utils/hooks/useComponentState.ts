import { useEffect, useState } from "react";

export const useComponentState = ({ ready, loading }, deps?) => {
  const [componentState, setState] = useState({ ready: false, loading: false });
  useEffect(
    () => {
      setState({ ...componentState, ready, loading });
    },
    deps ? deps : [ready, loading],
  );
  return { ready: componentState.ready, loading: componentState.loading };
};
