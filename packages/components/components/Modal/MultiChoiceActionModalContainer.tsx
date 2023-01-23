import React, { useContext } from "react";
import { store } from "@popcorn/components/context/store";
import MultiChoiceActionModal from "@popcorn/components/components/Modal/MultiChoiceActionModal";

export const MultiChoiceActionModalContainer: React.FC = () => {
  const {
    state: { multiChoiceActionModal },
  } = useContext(store);
  return (
    <MultiChoiceActionModal
      visible={multiChoiceActionModal.visible}
      title={multiChoiceActionModal.title}
      content={multiChoiceActionModal.content}
      children={multiChoiceActionModal.children}
      image={multiChoiceActionModal.image}
      type={multiChoiceActionModal.type}
      onDismiss={multiChoiceActionModal.onDismiss}
      onConfirm={multiChoiceActionModal.onConfirm}
      onSecondOption={multiChoiceActionModal.onSecondOption}
      onDontShowAgain={multiChoiceActionModal.onDontShowAgain}
    />
  );
};
