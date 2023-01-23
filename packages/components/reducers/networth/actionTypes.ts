import { BigNumber } from "ethers";
export type Status = "loading" | "success" | "error" | "idle";

export enum NetworthActionType {
  UPDATE_NETWORTH = "UPDATE_NETWORTH",
  UPDATE_POP_BALANCE = "UPDATE_POP_BALANCE",
  CLEAR_POP_BALANCE = "CLEAR_POP_BALANCE",
  UPDATE_VESTING_BALANCE = "UPDATE_VESTING_BALANCE",
  CLEAR_VESTING_BALANCE = "CLEAR_VESTING_BALANCE",
  RESET_STATE = "RESET_STATE",
}

interface UpdateNetworth {
  type: NetworthActionType.UPDATE_NETWORTH;
  payload: {
    key: string;
    value: BigNumber;
    status: Status;
  };
}

interface UpdatePopBalance {
  type: NetworthActionType.UPDATE_POP_BALANCE;
  payload: {
    value: BigNumber;
    status: Status;
  };
}

interface ClearPopBalance {
  type: NetworthActionType.CLEAR_POP_BALANCE;
}

interface UpdateVestingBalance {
  type: NetworthActionType.UPDATE_VESTING_BALANCE;
  payload: {
    value: BigNumber;
    status: Status;
  };
}
interface ClearVestingBalance {
  type: NetworthActionType.CLEAR_VESTING_BALANCE;
}

interface ResetState {
  type: NetworthActionType.RESET_STATE;
}

export type NetworthActions =
  | UpdateNetworth
  | UpdatePopBalance
  | ClearPopBalance
  | UpdateVestingBalance
  | ClearVestingBalance
  | ResetState
  | { type: null; payload: null };
