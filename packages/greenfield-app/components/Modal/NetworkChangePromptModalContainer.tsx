import React, { useContext } from "react";
import { store } from "@popcorn/greenfield-app/context/store";
import NetworkChangePromptModal from "components/Modal/NetworkChangePromptModal";

export const NetworkChangePromptModalContainer: React.FC = () => {
  const {
    state: { networkChangePromptModal },
  } = useContext(store);

  return (
    <NetworkChangePromptModal
      visible={networkChangePromptModal.visible}
      title={networkChangePromptModal.title}
      content={networkChangePromptModal.content}
      children={networkChangePromptModal.children}
      image={networkChangePromptModal.image}
      type={networkChangePromptModal.type}
      onChangeNetwork={networkChangePromptModal.onChangeNetwork}
      onChangeUrl={networkChangePromptModal.onChangeUrl}
      onDisconnect={networkChangePromptModal.onDisconnect}
      onDismiss={networkChangePromptModal.onDismiss}
    />
  );
};
