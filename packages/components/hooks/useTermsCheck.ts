import { setSingleActionModal } from "@popcorn/components/context/actions";
import { store } from "@popcorn/components/context/store";
import { verifyMessage } from "ethers/lib/utils";
import { useEffect } from "react";
import { useContext } from "react";
import { useAccount, useSignMessage } from "wagmi";

const getShortTerms = (timestamp) => {
  return `Welcome to Popcorn!
  Please read the disclaimer carefully before accessing, interacting with, or using the popcorndao.finance, consisting of the popcorndao.finance smart contract technology stack and the user interface for the Popcorn DeFi application, as well as any other application developed in the future (together the “Popcorn Software”). By signing this message, you confirm that you have carefully read this disclaimer(https://www.popcorndao.finance/disclaimer). - ${timestamp}`;
};

export default function useTermsCheck() {
  const { address: account } = useAccount();
  const { dispatch } = useContext(store);

  const { signMessage } = useSignMessage({
    onSuccess(data, variables) {
      // Verify signature when sign message succeeds
      const address = verifyMessage(variables.message, data);
      if (address) {
        dispatch(setSingleActionModal(false));
        localStorage.setItem("termsAndConditionsSigned", "true");
      }
    },
  });

  const showSignMessageModal = () => {
    dispatch(setSingleActionModal(false));
    dispatch(
      setSingleActionModal({
        title: "T&C",
        content: "To continue please sign terms and conditions.",
        onConfirm: {
          label: "Sign Message",
          onClick: () => {
            signMessage({ message: getShortTerms(Date.now()) });
          },
        },
        keepOpen: true,
      }),
    );
  };
  useEffect(() => {
    if (account && !localStorage.getItem("termsAndConditionsSigned")) showSignMessageModal();
  }, [account]);
}
