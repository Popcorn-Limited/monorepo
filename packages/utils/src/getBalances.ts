import { BigNumber } from "ethers";

export interface TokenBalances {
  pop: number;
  popUsdcLp: number;
  butter: number;
}
export interface BalanceOf {
  balanceOf: (address: string) => Promise<BigNumber>;
}

export interface ContractsWithBalance {
  pop: BalanceOf;
  popUsdcLp: BalanceOf;
  butter: BalanceOf;
}
