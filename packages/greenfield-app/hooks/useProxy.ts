import { useState } from "react";
import { useContractRead, useAccount } from "wagmi";

// mainnet
export const PROXY_REGISTRY_ADDRESS = "0x4678f0a6958e4D2Bc4F1BAF7Bc52E8F3564f3fE4";

export const PROXY_REGISTRY_ABI = [
  {
    constant: false,
    inputs: [],
    name: "build",
    outputs: [{ name: "proxy", type: "address" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "", type: "address" }],
    name: "proxies",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

/* Return the proxy address if it exsits, otherwise returns undefined */
export default function useProxy() {
  const { address } = useAccount();

  const [proxyAddress, setProxyAddress] = useState<string | undefined>();

  const { isError, isLoading } = useContractRead({
    address: PROXY_REGISTRY_ADDRESS,
    abi: PROXY_REGISTRY_ABI,
    functionName: "proxies(address)",
    args: [address],
    onSuccess: (data: string) => {
      if (data !== "0x0000000000000000000000000000000000000000") {
        setProxyAddress(data);
      }
    },
  });

  return { proxyAddress, isError, isLoading };
}
