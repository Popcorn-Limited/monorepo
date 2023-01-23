import { Dispatch } from "react";
import { NetworthActions, Status, NetworthActionType } from "./actionTypes";
import { BigNumber } from "ethers";

export const updateNetworth =
  (payload: { key: string; value: BigNumber; status: Status }) => (dispatch: Dispatch<NetworthActions>) => {
    dispatch({
      type: NetworthActionType.UPDATE_NETWORTH,
      payload,
    });
  };

export const updatePopBalance =
  (payload: { value: BigNumber; status: Status }) => (dispatch: Dispatch<NetworthActions>) => {
    dispatch({
      type: NetworthActionType.UPDATE_POP_BALANCE,
      payload,
    });
  };

export const clearPopBalance = () => (dispatch: Dispatch<NetworthActions>) => {
  dispatch({
    type: NetworthActionType.CLEAR_POP_BALANCE,
  });
};

export const updateVestingBalance =
  (payload: { value: BigNumber; status: Status }) => (dispatch: Dispatch<NetworthActions>) => {
    dispatch({
      type: NetworthActionType.UPDATE_VESTING_BALANCE,
      payload,
    });
  };

export const clearVestingBalance = () => (dispatch: Dispatch<NetworthActions>) => {
  dispatch({
    type: NetworthActionType.CLEAR_VESTING_BALANCE,
  });
};

export const resetNetworth = () => (dispatch: Dispatch<NetworthActions>) => {
  dispatch({
    type: NetworthActionType.RESET_STATE,
  });
};
