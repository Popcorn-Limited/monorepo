import type { BigNumber } from "ethers";
import type { useContractWrite } from "wagmi";

export namespace Pop {
  export type StdProps = BaseContractProps;
  export type BaseContractProps = ChainId & Partial<Account & Enabled & Address>;

  export type FC<T> = React.FC<FCProps<T> & Partial<HookResult<T>>>;

  export type FCProps<T> = BaseContractProps & T;

  export type WithStdRenderProps<T = StdProps> = StdProps & {
    render?: (props: StdProps & T) => JSX.Element;
  };

  export type HookResult<T = unknown> = UseQueryResult<T>;

  export type Hook<DataReturnValue = unknown> = <Props extends StdProps = StdProps>(
    props: FCProps<Props>,
  ) => HookResult<DataReturnValue>;

  export interface UseQueryResult<T> {
    data?: T;
    status: "idle" | "loading" | "success" | "error" | undefined;
  }

  export interface Address {
    address: string;
  }
  export interface ChainId {
    chainId: number;
  }
  export interface Account {
    account: string;
  }
  export interface Enabled {
    enabled: boolean;
  }

  export interface Erc20Metadata {
    name: string;
    symbol: string;
    decimals: number;
  }

  export interface NamedAccountsMetadata {
    isERC20?: boolean;
    priceResolver?: "staking" | "set_token" | "pop" | "univ3" | "arrakis" | "vault";
    balanceResolver?: "escrowBalance";
    apyResolver?: "synthetix" | "set_token" | "yearn" | "convex" | "yearnAsset";
    chainId?: string;
    address?: string;
    __alias?: string;
    symbol?: string;
    [key: string]: any;
  }
}
export interface BigNumberWithFormatted {
  value?: BigNumber;
  formatted?: string;
}

export interface BigNumberResponse {
  value?: BigNumber;
}

export type ContractWriteArgs = Partial<Parameters<typeof useContractWrite>[0]>;

export interface Escrow {
  id: string;
  start: number;
  lastUpdateTime: number;
  end: number;
  initialBalance: BigNumber;
  balance: BigNumber;
  account: string;
  claimable: BigNumber;
  vesting: BigNumber;
}

export interface LockedBalance {
  amount: BigNumber;
  boosted: BigNumber;
  unlockTime: number;
}
