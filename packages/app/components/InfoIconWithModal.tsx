import { setSingleActionModal } from "@popcorn/components/context/actions";
import { store } from "@popcorn/components/context/store";
import React, { useContext } from "react";

export interface InfoIconWithModalProps {
  title: string;
  content?: string | JSX.Element;
  children?: JSX.Element;
  image?: JSX.Element;
  size?: string;
}

export const InfoIconWithModal: React.FC<InfoIconWithModalProps> = ({
  title,
  content,
  children,
  size = "h-4 w-4",
  image,
}) => {
  const { dispatch } = useContext(store);

  return (
    <img
      src="/images/icons/tooltip.svg"
      onClick={() => {
        dispatch(
          setSingleActionModal({
            title,
            children,
            content,
            image,
            onDismiss: {
              label: "Dismiss",
              onClick: () => {
                dispatch(setSingleActionModal(false));
              },
            },
          }),
        );
      }}
      className={`ml-1 cursor-pointer ${size}`}
    />
  );
};
