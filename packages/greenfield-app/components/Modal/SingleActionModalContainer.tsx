import React, { useContext } from "react";
import { store } from "@popcorn/greenfield-app/context/store";
import SingleActionModal from "components/Modal/SingleActionModal";

export const SingleActionModalContainer: React.FC = () => {
  const {
    state: { singleActionModal },
  } = useContext(store);
  return (
    <SingleActionModal
      visible={singleActionModal.visible}
      title={singleActionModal.title}
      content={singleActionModal.content}
      children={singleActionModal.children}
      image={singleActionModal.image}
      type={singleActionModal.type}
      onDismiss={singleActionModal.onDismiss}
      onConfirm={singleActionModal.onConfirm}
      keepOpen={singleActionModal.keepOpen}
      isTerms={singleActionModal.isTerms}
    />
  );
};
