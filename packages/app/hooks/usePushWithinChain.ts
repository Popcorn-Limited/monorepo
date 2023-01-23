import { useRouter } from "next/router";
import { useCallback } from "react";
import { useChainUrl } from "@popcorn/app/hooks/useChainUrl";
import { useNetwork } from "wagmi";

export default function usePushWithinChain() {
  const router = useRouter();
  const prefix = useChainUrl();
  const { chain } = useNetwork();

  return useCallback(
    (url: string, shallow = false) => {
      // Remove a leading dash if someone added it by accident
      if (url[0] === "/") {
        url = url.slice(1, url.length);
      }
      router.push({ pathname: prefix(url) }, undefined, {
        shallow: shallow,
      });
    },
    [prefix, chain?.id],
  );
}
