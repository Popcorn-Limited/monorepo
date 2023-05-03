import { store } from "@popcorn/greenfield-app/context/store";
import { Dispatch, useContext, useEffect } from "react";
import PageLoader from "./PageLoader";

interface GlobalLinearProgressAndLoadingProps {
  loading: boolean;
  setLoading: Dispatch<boolean>;
}

export function GlobalLinearProgressAndLoading({
  loading,
  setLoading,
}: GlobalLinearProgressAndLoadingProps): JSX.Element {
  const {
    state: { globalLoaderVisible },
  } = useContext(store);

  useEffect(() => {
    if (globalLoaderVisible) {
      return setLoading(true);
    }
    setLoading(false);

    return () => {
      setLoading(false);
    };
  }, [globalLoaderVisible]);

  return loading ? (
    <div className={"fixed top-0 left-0 w-screen h-screen z-50 bg-white"}>
      <PageLoader />
    </div>
  ) : (
    <></>
  );
}
