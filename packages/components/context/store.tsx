import {
  DefaultMultiChoiceActionModalProps,
  MultiChoiceActionModalProps,
} from "@popcorn/components/components/Modal/MultiChoiceActionModal";
import {
  DefaultNetworkChangePromptModalProps,
  NetworkChangePromptModalProps,
} from "@popcorn/components/components/Modal/NetworkChangePromptModal";
import {
  DefaultSingleActionModalProps,
  SingleActionModalProps,
} from "@popcorn/components/components/Modal/SingleActionModal";
import React, { createContext, useReducer } from "react";
import {
  DefaultDualActionModalProps,
  DualActionModalProps,
} from "@popcorn/components/components/Modal/DualActionModal";
import {
  AppActions,
  CLEAR_NOTIFICATIONS,
  DUAL_ACTION_MODAL,
  DUAL_ACTION_WIDE_MODAL,
  HIDE_GLOBAL_LOADER,
  HIDE_NOTIFICATION,
  MOBILE_FULL_SCREEN_MODAL,
  MULTI_CHOICE_ACTION_MODAL,
  NETWORK_CHANGE_PROMPT_MODAL,
  PUSH_NOTIFICATION,
  SHOW_GLOBAL_LOADER,
  SINGLE_ACTION_MODAL,
  UNSET_NOTIFICATION,
  WALLET_SELECT_MODAL,
} from "@popcorn/components/context/actions";

interface DefaultState {
  singleActionModal: SingleActionModalProps;
  multiChoiceActionModal: MultiChoiceActionModalProps;
  dualActionModal: DualActionModalProps;
  networkChangePromptModal: NetworkChangePromptModalProps;
  globalLoaderVisible?: boolean;
}

const initialState: DefaultState = {
  singleActionModal: {
    ...DefaultSingleActionModalProps,
  },
  multiChoiceActionModal: {
    ...DefaultMultiChoiceActionModalProps,
  },
  networkChangePromptModal: {
    ...DefaultNetworkChangePromptModalProps,
  },
  dualActionModal: {
    ...DefaultDualActionModalProps,
  },
};

const store = createContext(
  initialState as unknown as {
    state: DefaultState;
    dispatch: React.Dispatch<any>;
  },
);
const { Provider } = store;

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state: DefaultState, action: AppActions) => {
    switch (action.type) {
      case SINGLE_ACTION_MODAL:
        return {
          ...state,
          singleActionModal: {
            ...action.payload,
          },
        };
      case MULTI_CHOICE_ACTION_MODAL:
        return {
          ...state,
          multiChoiceActionModal: {
            ...action.payload,
          },
        };
      case NETWORK_CHANGE_PROMPT_MODAL:
        return {
          ...state,
          networkChangePromptModal: {
            ...action.payload,
          },
        };
      case DUAL_ACTION_MODAL:
        return {
          ...state,
          dualActionModal: {
            ...action.payload,
          },
        };
      case SHOW_GLOBAL_LOADER:
      case HIDE_GLOBAL_LOADER:
        return {
          ...state,
          globalLoaderVisible: action.payload,
        };
      default:
        return {
          ...state,
        };
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
