import { ChainId, PRC_PROVIDERS } from "@popcorn/utils";
import useWeb3Callbacks from "@popcorn/app/helper/useWeb3Callbacks";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import { useAccount, useNetwork, useSigner, useSwitchNetwork } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export default function useWeb3() {
  const router = useRouter();
  const { openConnectModal } = useConnectModal();
  const { address: account } = useAccount();
  const { data: signer } = useSigner();
  const { chain, chains } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const signerOrProvider = useMemo(() => signer || getCurrentRpcProvider(), [signer]);
  const contractAddresses = useDeployment(chain?.id);
  const { onSuccess: onContractSuccess, onError: onContractError } = useWeb3Callbacks(chain?.id);

  function getChainId(): ChainId {
    return chain?.id ?? ChainId.Ethereum;
  }

  async function setChainFromNumber(newChainId: number): Promise<void> {
    if (account || (chain?.id && newChainId !== chain?.id)) {
      switchNetwork(Number(newChainId));
      pushNetworkChange(ChainId[newChainId], true);
    } else {
      await pushNetworkChange(ChainId[newChainId], true);
    }
  }

  function getCurrentRpcProvider() {
    return PRC_PROVIDERS[getChainId()];
  }

  async function pushNetworkChange(network: string, shallow: boolean): Promise<boolean> {
    return router.push(
      { pathname: router.pathname, query: { ...router.query, network: network.toLowerCase() } },
      undefined,
      {
        shallow: shallow,
      },
    );
  }

  return {
    account,
    connectedChainId: getChainId(),
    signerOrProvider,
    rpcProvider: getCurrentRpcProvider(),
    signer,
    contractAddresses,
    onContractSuccess,
    onContractError,
    chains,
    setChain: (newChainId: number) => setChainFromNumber(newChainId),
    switchNetwork,
    connect: openConnectModal,
  };
}
