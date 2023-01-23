import { DualActionModalProps } from "@popcorn/components/components/Modal/DualActionModal";
import { MultiChoiceActionModalProps } from "@popcorn/components/components/Modal/MultiChoiceActionModal";
import { SingleActionModalProps } from "@popcorn/components/components/Modal/SingleActionModal";
import { setMultiChoiceActionModal, setSingleActionModal } from "@popcorn/components/context/actions";

export enum ModalType {
  SingleAction,
  MultiChoice,
  DualAction,
}

export const toggleModal = (
  modalType: ModalType,
  modalConfig: Partial<MultiChoiceActionModalProps> | Partial<SingleActionModalProps> | Partial<DualActionModalProps>,
  key: string,
  dispatch: React.Dispatch<any>,
) => {
  if (!localStorage.getItem(key)) {
    if (modalType === ModalType.SingleAction) {
      dispatch(setSingleActionModal(modalConfig as Partial<SingleActionModalProps>));
    } else if (modalType === ModalType.MultiChoice) {
      dispatch(setMultiChoiceActionModal(modalConfig as Partial<MultiChoiceActionModalProps>));
    }
  }
};
