import { setSingleActionModal } from "@popcorn/components/context/actions";
import { store } from "@popcorn/components/context/store";
import { verifyMessage } from "ethers/lib/utils";
import { useEffect } from "react";
import { useContext } from "react";
import { useAccount, useSignMessage } from "wagmi";

const getShortTerms = (timestamp) => {
  return `
  By signing this message you agree to the following:
  - I understand this software is experimental and interacting with smart contracts includes risk including loss of funds. 
  - I am not the person or entities who reside in, are citizens of, are incorporated in, or have a registered office in the United States of America, the European Union or any Prohibited Localities including Myanmar (Burma), Cote D'Ivoire (Ivory Coast), Cuba, Crimea and Sevastopol, Democratic Republic of
  Congo, Iran, Iraq, Libya, Mali, Nicaragua, Democratic People’s Republic of Korea (North Korea), Somalia,
  Sudan, Syria, Yemen, Zimbabwe or any other state, country or region that is subject to sanctions
  enforced by the United States, the United Kingdom or the European Union.
  - I will not in the future access this site or use popcorndao.finance dApp while located within the United States or any Prohibited Localities.
  - I am not using, and will not in the future use, a VPN to mask my physical location from a restricted territory.
  - I am lawfully permitted to access this site and use popcorndao.finance under the laws of the jurisdiction on which I reside and am located.
: ${timestamp}
  `;
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
