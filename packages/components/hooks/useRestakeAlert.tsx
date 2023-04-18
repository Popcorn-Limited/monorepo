import { setMultiChoiceActionModal } from "@popcorn/components/context/actions";
import { store } from "@popcorn/components/context/store";
import { constants } from "ethers";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import useNetworkName from "@popcorn/components/hooks/useNetworkName";
import { useLockedBalances } from "@popcorn/components/lib/PopLocker/hooks";
import { useAccount, useNetwork } from "wagmi";
import { useNamedAccounts } from "@popcorn/components/lib/utils";


export const getStorage = (key: string) => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};
export const setStorage = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
};
export const removeStorage = (key: string) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};


const ONE_DAY = 1000 * 60 * 60 * 24;

export default function useRestakeAlert() {
  const { dispatch, state } = useContext(store);
  const router = useRouter();
  const { address: account } = useAccount();
  const { chain } = useNetwork();
  const networkName = useNetworkName();
  const [restakeAlerted, setRestakeAlerted] = useState<boolean>(false);
  const [popLocker] = useNamedAccounts(chain?.id as any, ["popStaking"])
  const lockedBalances = useLockedBalances({ chainId: chain?.id, address: popLocker?.address, account })

  useEffect(() => {
    if (!account || !popLocker) return;
    if (
      lockedBalances?.data?.unlockable.gt(constants.Zero) &&
      !restakeAlerted &&
      state.networkChangePromptModal.visible === false &&
      state.singleActionModal.content !== "To continue please sign terms and conditions." &&
      (!getStorage("lastRestakeAlert") || Date.now() - Number(getStorage("lastRestakeAlert")) > ONE_DAY)
    ) {
      dispatch(
        setMultiChoiceActionModal({
          image: <img src="/images/modalImages/restake.svg" />,
          title: "It's time to restake!",
          content:
            "Your POP tokens must be re-staked or withdrawn after the 3-month lock time expires or they will be subjected to a penalty of 1% per epoch week that they are not re-staked",
          type: "alert",
          onConfirm: {
            label: "Restake Now",
            onClick: () => {
              setRestakeAlerted(true);
              router.push({ pathname: `/${networkName}/staking/pop`, query: { action: "withdraw" } });
            },
          },
          onSecondOption: {
            label: "Withdraw Now",
            onClick: () => {
              setRestakeAlerted(true);
              router.push({ pathname: `/${networkName}/staking/pop`, query: { action: "withdraw" } });
            },
          },
          onDismiss: {
            label: "Dismiss",
            onClick: () => {
              setStorage("lastRestakeAlert", Date.now().toString());
              dispatch(setMultiChoiceActionModal(false));
            },
          },
        }),
      );
    }
  }, [popLocker, state.networkChangePromptModal.visible]);
}
