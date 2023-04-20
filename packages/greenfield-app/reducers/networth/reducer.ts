import { BigNumber } from "ethers";
import { NetworthActions, NetworthActionType } from "./actionTypes";

type Status = "loading" | "success" | "error" | "idle";

export interface NetworthState {
  total: {
    [key: string]: { value: BigNumber; status: Status };
  };
  popInWallet: { value: BigNumber; status: Status }[];
  vestingBalance: { value: BigNumber; status: Status }[];
}

export const initialState: NetworthState = {
  total: {},
  popInWallet: [],
  vestingBalance: [],
};

export const networthReducer = (state = initialState, action: NetworthActions = { type: null, payload: null }) => {
  switch (action.type) {
    case NetworthActionType.UPDATE_NETWORTH: {
      return {
        ...state,
        total: {
          ...state.total,
          [action.payload.key]: {
            value: action.payload.value,
            status: action.payload.status,
          },
        },
      };
    }

    case NetworthActionType.UPDATE_POP_BALANCE: {
      return {
        ...state,
        popInWallet: [...state.popInWallet, action.payload],
      };
    }

    case NetworthActionType.CLEAR_POP_BALANCE: {
      return {
        ...state,
        popInWallet: [],
      };
    }

    case NetworthActionType.UPDATE_VESTING_BALANCE: {
      return {
        ...state,
        vestingBalance: [...state.vestingBalance, action.payload],
      };
    }

    case NetworthActionType.CLEAR_VESTING_BALANCE: {
      return {
        ...state,
        vestingBalance: [],
      };
    }

    case NetworthActionType.RESET_STATE: {
      return initialState;
    }

    default:
      return state;
  }
};
