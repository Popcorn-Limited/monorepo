/* This example requires Tailwind CSS v2.0+ */
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import MainActionButton from "@popcorn/greenfield-app/components/MainActionButton";
import TertiaryActionButton from "@popcorn/greenfield-app/components/TertiaryActionButton";
import React, { Fragment, useEffect, useRef, useState } from "react";

export interface NetworkChangePromptModalProps {
  title: string;
  children?: JSX.Element;
  content?: string;
  visible: boolean;
  type?: "info" | "error" | "alert";
  image?: JSX.Element;
  onChangeUrl?: { label: string; onClick: Function };
  onChangeNetwork?: { label: string; onClick: Function };
  onDisconnect?: { label: string; onClick: Function };
  onDismiss?: { onClick: Function };
}
export const DefaultNetworkChangePromptModalProps: NetworkChangePromptModalProps = {
  content: "",
  title: "",
  visible: false,
  type: "error",
};

export const NetworkChangePromptModal: React.FC<NetworkChangePromptModalProps> = ({
  title,
  type,
  visible,
  children,
  content,
  image,
  onChangeUrl,
  onChangeNetwork,
  onDisconnect,
  onDismiss,
}) => {
  const [open, setOpen] = useState(visible);
  const cancelButtonRef = useRef();

  useEffect(() => {
    if (visible !== open) setOpen(visible);
    return () => {
      setOpen(false);
    };
  }, [visible]);

  const changeNetwork = () => {
    setTimeout(() => onChangeNetwork?.onClick && onChangeNetwork.onClick(), 1000);
  };

  const changeUrl = () => {
    setTimeout(() => onChangeUrl?.onClick && onChangeUrl.onClick(), 1000);
  };

  const disconnect = () => {
    setTimeout(() => onDisconnect?.onClick && onDisconnect.onClick(), 1000);
  };

  const dismiss = () => {
    setTimeout(() => onDismiss?.onClick && onDismiss.onClick(), 500);
  };

  if (!visible) return <></>;

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-70 inset-0 overflow-y-auto"
        // @ts-ignore
        initialFocus={cancelButtonRef}
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed z-50 inset-0 overflow-y-auto"
              aria-labelledby="modal-title"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-primary bg-opacity-75 transition-opacity " aria-hidden="true"></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                  &#8203;
                </span>
                <div className="inline-block align-bottom bg-white rounded-lg p-6 md:p-10 mb-12 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-88 md:max-w-md sm:w-full sm:p-8">
                  <div className="flex justify-end">
                    <XMarkIcon className="w-10 h-10 text-black mb-10" onClick={dismiss} role="button" />
                  </div>
                  <div>
                    <img src="/images/modalImages/inconsistentNetwork.svg" />
                    <div className="mt-10">
                      <h3 className="text-6xl leading-13 text-black" id="modal-title">
                        {title}
                      </h3>
                      <div className="mt-4">
                        {children ? (
                          children
                        ) : (
                          <p className="text-base md:text-sm text-primaryDark leading-5">{content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 md:mt-8">
                    <div>
                      {onChangeNetwork && (
                        <>
                          <MainActionButton label={onChangeNetwork.label} handleClick={changeNetwork} />
                        </>
                      )}
                      {(onChangeUrl || onDisconnect) && (
                        <div className="flex justify-center vertical-align h-6 my-4">
                          <img src="/images/butter/primary-btn-divider.svg" className="w-full object-cover" />
                        </div>
                      )}
                      {onChangeUrl && (
                        <div className="w-full">
                          <TertiaryActionButton label={onChangeUrl.label} handleClick={changeUrl} />
                        </div>
                      )}
                      {onDisconnect && (
                        <div className="w-full mt-4">
                          <TertiaryActionButton label={onDisconnect.label} handleClick={disconnect} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
export default NetworkChangePromptModal;
