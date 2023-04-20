import Image from "next/image";
import { useContext } from "react";
import { setMultiChoiceActionModal } from "@popcorn/greenfield-app/context/actions";
import { store } from "@popcorn/greenfield-app/context/store";

export default function useClaimModal() {
  const { dispatch } = useContext(store);

  const hideModal = () => dispatch(setMultiChoiceActionModal(false));

  const openModal = () =>
    !localStorage.getItem("hideClaimModal")
      ? null
      : dispatch(
          setMultiChoiceActionModal({
            image: (
              <div className="relative w-24 h-24">
                <Image src="/images/modalImages/vestingImage.svg" alt={"vestingImage"} fill />
              </div>
            ),
            title: "Sweet!",
            content:
              "You have just claimed 10% of your earned rewards. The rest of the rewards will be claimable over the next 365 days",
            onConfirm: {
              label: "Continue",
              onClick: hideModal,
            },
            onDismiss: {
              onClick: hideModal,
            },
            onDontShowAgain: {
              label: "Do not remind me again",
              onClick: () => {
                localStorage.setItem("hideClaimModal", "true");
                hideModal();
              },
            },
          }),
        );

  return {
    hideModal,
    openModal,
  } as const;
}
