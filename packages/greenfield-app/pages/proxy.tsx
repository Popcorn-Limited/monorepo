import useProxy, { PROXY_REGISTRY_ADDRESS, PROXY_REGISTRY_ABI } from "hooks/useProxy";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

export default function Proxy(): JSX.Element {
  const { config } = usePrepareContractWrite({
    address: PROXY_REGISTRY_ADDRESS,
    abi: PROXY_REGISTRY_ABI,
    functionName: "build()",
  });

  const { data, isSuccess, write, isLoading } = useContractWrite(config);

  const { proxyAddress } = useProxy();

  return (
    <div>
      <button disabled={!write} onClick={() => write?.()}>
        Feed
      </button>
      {isLoading && <div>Check Wallet</div>}
      {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
      {proxyAddress && proxyAddress}
    </div>
  );
}
