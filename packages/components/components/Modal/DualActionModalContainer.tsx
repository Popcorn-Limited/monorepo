import React, { useContext } from "react";
import { store } from "@popcorn/components/context/store";
import DualActionModal from "@popcorn/components/components/Modal/DualActionModal";

export const DualActionModalContainer: React.FC = () => {
  const {
    state: { dualActionModal },
  } = useContext(store);
  return (
    <DualActionModal
      visible={dualActionModal.visible}
      title={dualActionModal.title}
      content={dualActionModal.content}
      onDismiss={dualActionModal.onDismiss}
      onConfirm={dualActionModal.onConfirm}
    />
  );
};
export default DualActionModalContainer;
