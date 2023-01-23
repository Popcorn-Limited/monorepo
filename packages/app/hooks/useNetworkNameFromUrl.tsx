import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const useNetworkNameFromUrl = () => {
  const router = useRouter();
  const [networkName, setNetworkName] = useState<string>("");
  useEffect(() => {
    if (router?.query?.network) {
      setNetworkName(router?.query?.network as string);
    }
  });
  return networkName;
};
export default useNetworkNameFromUrl;
