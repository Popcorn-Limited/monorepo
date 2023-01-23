import type { BigNumber } from "ethers";
import type { ReactNode } from "react";

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
    account: `0x${string}`;
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
    priceResolver?: "staking" | "set_token" | "pop" | "univ3" | "arrakis";
    balanceResolver?: "escrowBalance";
    apyResolver?: "synthetix";
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
