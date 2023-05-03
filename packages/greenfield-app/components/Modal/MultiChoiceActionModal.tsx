/* This example requires Tailwind CSS v2.0+ */
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import MainActionButton from "@popcorn/greenfield-app/components/MainActionButton";
import TertiaryActionButton from "@popcorn/greenfield-app/components/TertiaryActionButton";
import React, { Fragment, useEffect, useRef, useState } from "react";

export interface MultiChoiceActionModalProps {
  title: string;
  children?: JSX.Element;
  content?: string;
  visible: boolean;
  type?: "info" | "error" | "alert";
  image?: JSX.Element;
  onConfirm?: { label: string; onClick: Function };
  onSecondOption?: { label: string; onClick: Function };
  onDismiss?: { label?: string; onClick: Function };
  onDontShowAgain?: { label?: string; onClick: Function };
}
export const DefaultMultiChoiceActionModalProps: MultiChoiceActionModalProps = {
  content: "",
  title: "",
  visible: false,
  type: "info",
};

export const MultiChoiceActionModal: React.FC<MultiChoiceActionModalProps> = ({
  title,
  type,
  visible,
  children,
  content,
  image,
  onConfirm,
  onSecondOption,
  onDismiss,
  onDontShowAgain,
}) => {
  const [open, setOpen] = useState(visible);
  const cancelButtonRef = useRef();

  useEffect(() => {
    if (visible !== open) setOpen(visible);
    return () => {
      setOpen(false);
    };
  }, [visible]);

  const dismiss = () => {
    setOpen(false);
    setTimeout(() => onDismiss?.onClick && onDismiss.onClick(), 1000);
  };

  const confirm = () => {
    setOpen(false);
    setTimeout(() => onConfirm?.onClick && onConfirm.onClick(), 1000);
  };

  const secondOption = () => {
    setOpen(false);
    setTimeout(() => onSecondOption?.onClick && onSecondOption.onClick(), 1000);
  };

  const dontShowAgain = () => {
    onDontShowAgain?.onClick && onDontShowAgain.onClick();
  };

  if (!visible) return <></>;

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-50 inset-0 overflow-y-auto"
        //@ts-ignore
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
                <div className="fixed inset-0 bg-primary bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                  &#8203;
                </span>
                <div className="inline-block align-bottom bg-white rounded-lg p-6 md:p-10 text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle w-88 md:max-w-md sm:w-full sm:p-8">
                  <Dialog.Panel>
                    <div>
                      {/* Always add onDismiss prop when calling modal else this will break */}
                      <div className="flex justify-end">
                        <XMarkIcon className="w-10 h-10 text-black mb-10" onClick={dismiss} role="button" />
                      </div>
                      <div>{image}</div>
                      <div className="mt-10">
                        <h3 className="text-6xl leading-13 text-black" id="modal-title">
                          {title}
                        </h3>
                        <div className="mt-4">
                          {children ? children : <p className="text-base text-primaryDark leading-5">{content}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-10">
                      <div>
                        {onConfirm && (
                          <>
                            <MainActionButton label={onConfirm.label} handleClick={confirm} />
                          </>
                        )}
                        {onSecondOption && (
                          <div className="mt-6">
                            <TertiaryActionButton label={onSecondOption.label} handleClick={secondOption} />
                          </div>
                        )}
                        {onDismiss?.label && (
                          <div className="w-full">
                            {/* or */}
                            <div className="flex justify-center vertical-align h-6 my-3 md:my-7">
                              <img src="/images/butter/primary-btn-divider.svg" />
                            </div>
                            <TertiaryActionButton label={onDismiss.label} handleClick={dismiss} />
                          </div>
                        )}
                        {onDontShowAgain && (
                          <div className="flex justify-center mt-4">
                            <button className="text-primary hover:text-black font-medium" onClick={dontShowAgain}>
                              {onDontShowAgain.label}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Dialog.Panel>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
export default MultiChoiceActionModal;
