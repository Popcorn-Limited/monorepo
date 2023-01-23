import { setMultiChoiceActionModal } from "@popcorn/components/context/actions";
import { store } from "@popcorn/components/context/store";
import { constants } from "ethers";
import { getStorage, setStorage } from "@popcorn/app/helper/safeLocalstorageAccess";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import usePopLocker from "@popcorn/app/hooks/staking/usePopLocker";
import useNetworkName from "@popcorn/app/hooks/useNetworkName";
import useWeb3 from "@popcorn/app/hooks/useWeb3";

const ONE_DAY = 1000 * 60 * 60 * 24;

export default function useRestakeAlert() {
  const { dispatch, state } = useContext(store);
  const {
    connectedChainId,
    account,
    contractAddresses: { popStaking },
  } = useWeb3();
  const { data: popLocker } = usePopLocker(popStaking, connectedChainId);
  const router = useRouter();
  const networkName = useNetworkName();
  const [restakeAlerted, setRestakeAlerted] = useState<boolean>(false);

  useEffect(() => {
    if (!account || !popLocker) return;
    if (
      popLocker.withdrawable.gt(constants.Zero) &&
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
