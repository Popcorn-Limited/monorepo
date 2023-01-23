import { DualActionModalProps } from "@popcorn/components/components/Modal/DualActionModal";
import {
  DefaultMultiChoiceActionModalProps,
  MultiChoiceActionModalProps,
} from "@popcorn/components/components/Modal/MultiChoiceActionModal";
import {
  DefaultSingleActionModalProps,
  SingleActionModalProps,
} from "@popcorn/components/components/Modal/SingleActionModal";
import { DefaultDualActionModalProps } from "@popcorn/components/components/Modal/DualActionModal";

export const PUSH_NOTIFICATION = "notifications/PUSH_NOTIFICATION";
export const UNSET_NOTIFICATION = "notifications/UNSET_NOTIFICATION";
export const HIDE_NOTIFICATION = "notifications/HIDE_NOTIFICATION";
export const CLEAR_NOTIFICATIONS = "notifications/CLEAR_NOTIFICATIONS";
export const NETWORK_CHANGE_PROMPT_MODAL = "modals/NETWORK_CHANGE_PROMPT_MODAL";
export const MOBILE_FULL_SCREEN_MODAL = "modals/MOBILE_FULL_SCREEN_MODAL";
export const SINGLE_ACTION_MODAL = "modals/SINGLE_ACTION_MODAL";
export const WALLET_SELECT_MODAL = "modals/WALLET_SELECT_MODAL";
export const MULTI_CHOICE_ACTION_MODAL = "modals/MULTI_CHOICE_ACTION_MODAL";
export const DUAL_ACTION_MODAL = "modals/DUAL_ACTION_MODAL";
export const DUAL_ACTION_WIDE_MODAL = "modals/DUAL_ACTION_WIDE_MODAL";
export const SHOW_GLOBAL_LOADER = "ui/SHOW_GLOBAL_LOADER";
export const HIDE_GLOBAL_LOADER = "ui/HIDE_GLOBAL_LOADER";

export const UPDATE_STAKING_PAGE_INFO = "staking/UPDATE_STAKING_PAGE_INFO";

export type AppActions =
  | SetSingleActionModalAction
  | SetDualActionModalAction
  | SetMultiChoiceActionModalAction
  | ShowGlobalLoaderAction;

export interface ShowGlobalLoaderAction {
  type: typeof SHOW_GLOBAL_LOADER | typeof HIDE_GLOBAL_LOADER;
  payload: boolean;
}

export const showGlobalLoader = (): ShowGlobalLoaderAction => {
  return {
    type: SHOW_GLOBAL_LOADER,
    payload: true,
  };
};

export const hideGlobalLoader = (): ShowGlobalLoaderAction => {
  return {
    type: HIDE_GLOBAL_LOADER,
    payload: false,
  };
};
export interface SetSingleActionModalAction {
  type: typeof SINGLE_ACTION_MODAL;
  payload: SingleActionModalProps;
}

export const setSingleActionModal = (props: Partial<SingleActionModalProps> | false): SetSingleActionModalAction => {
  if (!props) {
    return {
      type: SINGLE_ACTION_MODAL,
      payload: {
        ...DefaultSingleActionModalProps,
        visible: false,
      },
    };
  }
  return {
    type: SINGLE_ACTION_MODAL,
    payload: {
      ...DefaultSingleActionModalProps,
      visible: true,
      ...props,
    },
  };
};

export interface SetMultiChoiceActionModalAction {
  type: typeof MULTI_CHOICE_ACTION_MODAL;
  payload: MultiChoiceActionModalProps;
}

export const setMultiChoiceActionModal = (
  props: Partial<MultiChoiceActionModalProps> | false,
): SetMultiChoiceActionModalAction => {
  if (!props) {
    return {
      type: MULTI_CHOICE_ACTION_MODAL,
      payload: {
        ...DefaultMultiChoiceActionModalProps,
        visible: false,
      },
    };
  }
  return {
    type: MULTI_CHOICE_ACTION_MODAL,
    payload: {
      ...DefaultMultiChoiceActionModalProps,
      visible: true,
      ...props,
    },
  };
};

export interface SetDualActionModalAction {
  type: typeof DUAL_ACTION_MODAL;
  payload: DualActionModalProps;
}
export const setDualActionModal = (props: Partial<DualActionModalProps> | false): SetDualActionModalAction => {
  if (!props) {
    return {
      type: DUAL_ACTION_MODAL,
      payload: {
        ...DefaultDualActionModalProps,
        visible: false,
      },
    };
  }
  return {
    type: DUAL_ACTION_MODAL,
    payload: {
      ...DefaultDualActionModalProps,
      visible: true,
      ...props,
    },
  };
};
