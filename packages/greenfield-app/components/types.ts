import {
  PortfolioState,
  PortfolioToken,
  PortfolioTokenAsyncProperty,
  UpdateWalletBalanceActionProps,
} from "../reducers/portfolio";

export type BaseTokenProps<T> = {
  address: string;
  chainId: number;
  account?: string;
  token?: PortfolioToken;
  state?: PortfolioState;
  isLoading?: boolean;
} & PortfolioTokenAsyncProperty<T>;

export interface BaseWalletTokenProps<T> extends BaseTokenProps<T> {
  updateWallet?: (args: UpdateWalletBalanceActionProps) => void;
}
