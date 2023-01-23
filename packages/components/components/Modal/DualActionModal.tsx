import MainActionButton from "@popcorn/app/components/MainActionButton";
import SecondaryActionButton from "@popcorn/app/components/SecondaryActionButton";
import React, { useEffect, useRef, useState } from "react";

export interface DualActionModalProps {
  title: string;
  content: JSX.Element | string;
  visible: boolean;
  onDismiss: { label: string; onClick: Function };
  onConfirm: { label: string; onClick: Function };
}

export const DefaultDualActionModalProps = {
  content: "",
  title: "",
  visible: false,
  onConfirm: { label: "", onClick: () => {} },
  onDismiss: { label: "", onClick: () => {} },
};

export const DualActionModal: React.FC<DualActionModalProps> = ({ title, content, visible, onDismiss, onConfirm }) => {
  const [open, setOpen] = useState(visible);
  const cancelButtonRef = useRef();

  useEffect(() => {
    if (visible !== open) setOpen(visible);
  }, [visible]);

  const dismiss = () => {
    setOpen(false);
    setTimeout(() => onDismiss?.onClick && onDismiss.onClick(), 1000);
  };

  const confirm = () => {
    setOpen(false);
    setTimeout(() => onConfirm?.onClick && onConfirm.onClick(), 1000);
  };

  if (!visible) return <></>;
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-4xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-88 md:max-w-md sm:w-full sm:p-6">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-2xl leading-6 font-semibold text-gray-900" id="modal-title">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-base text-gray-500">{content}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            {onConfirm && <MainActionButton label={onConfirm.label} handleClick={() => confirm()}></MainActionButton>}
            {onDismiss && (
              <SecondaryActionButton label={onDismiss.label} handleClick={() => dismiss()}></SecondaryActionButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DualActionModal;
