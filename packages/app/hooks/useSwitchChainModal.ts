import { networkMap } from "@popcorn/utils/src/connectors";
import { setNetworkChangePromptModal } from "@popcorn/components/context/actions";
import { store } from "@popcorn/components/context/store";
import { useCallback, useContext } from "react";
import useWeb3 from "@popcorn/app/hooks/useWeb3";

export function useSwitchChainModal(expectedChain: number, actualChain: number) {
  const { setChain } = useWeb3();
  const { dispatch } = useContext(store);
  const expectedChainName = networkMap[expectedChain];

  return useCallback(() => {
    dispatch(
      setNetworkChangePromptModal({
        content: `Your wallet is not currently connected to ${expectedChainName}. Please switch networks and try again.`,
        title: "Network Inconsistency",
        type: "error",
        onChangeNetwork: {
          label: `Switch to ${expectedChainName}`,
          onClick: () => {
            setChain(Number(expectedChain)).then((res) => {
              dispatch(setNetworkChangePromptModal(false));
            });
          },
        },
        onDismiss: {
          onClick: () => {
            dispatch(setNetworkChangePromptModal(false));
          },
        },
      }),
    );
  }, [expectedChain, actualChain]);
}
