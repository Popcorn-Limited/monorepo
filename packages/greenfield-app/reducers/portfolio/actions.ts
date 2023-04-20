import { ChainId } from "@popcorn/greenfield-app/lib/utils/connectors";
import { BigNumber } from "ethers";
import { PortfolioToken } from "./reducer";

export const UPDATE_TOKEN = "UPDATE_TOKEN";
export const UPDATE_WALLET = "UPDATE_WALLET";
export const UPDATE_NETWORTH = "UPDATE_NETWORTH";
export const RESET = "RESET";

interface UpdateTokenAction {
  type: typeof UPDATE_TOKEN;
  payload?: PortfolioToken;
}
export type UpdateTokenActionCreator = (args: PortfolioToken | undefined) => UpdateTokenAction;

export const updateToken: UpdateTokenActionCreator = (metadata?) => {
  console.log({ updateTokenMetadata: metadata });
  return { type: UPDATE_TOKEN, payload: metadata ? { ...metadata } : undefined };
};

interface WalletToken {
  chainId: ChainId;
  token: string;
  account?: string;
}

export type UpdateWalletBalanceActionProps = WalletToken & Omit<PortfolioToken, "address">;

export type UpdateWalletActionCreator = (args: UpdateWalletBalanceActionProps) => UpdateWalletAction;

interface UpdateWalletAction {
  type: typeof UPDATE_WALLET;
  payload: UpdateWalletBalanceActionProps | undefined;
}
export const updateWallet: UpdateWalletActionCreator = (metadata?) => {
  return {
    type: UPDATE_WALLET,
    payload: metadata ? { ...metadata } : undefined,
  };
};

export interface UpdateNetworthActionProps {
  account: string;
  value?: BigNumber;
  isLoading?: boolean;
  error?: boolean;
}

interface UpdateNetworthAction {
  type: typeof UPDATE_NETWORTH;
  payload: UpdateNetworthActionProps;
}

export type UpdateNetworthActionCreator = (args: UpdateNetworthActionProps) => UpdateNetworthAction;

export const updateNetworth: UpdateNetworthActionCreator = ({ account, value, isLoading, error }) => {
  return {
    type: UPDATE_NETWORTH,
    payload: { account, value, isLoading, error },
  };
};

export const reset = () => {
  return { type: RESET };
};
