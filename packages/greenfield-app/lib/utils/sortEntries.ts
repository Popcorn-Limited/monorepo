import { BigNumber } from "ethers";

export enum SortingType {
  BalDesc,
  BalAsc,
}

export type BalanceByKey = { [key: string]: { value: BigNumber | undefined; chainId: number } };

export const getItemKey = (token: any) => `${token.chainId}:${token.__alias}:${token.address}`;

function sortBalDesc(a, b, balances: BalanceByKey): 0 | 1 | -1 {
  const aValue = balances[getItemKey(a)]?.value;
  const bValue = balances[getItemKey(b)]?.value;
  return bValue?.gt(aValue || 0) ? 1 : -1;
}

function sortBalAsc(a, b, balances: BalanceByKey): 0 | 1 | -1 {
  const aValue = balances[getItemKey(a)]?.value;
  const bValue = balances[getItemKey(b)]?.value;
  return bValue?.lt(aValue || 0) ? 1 : -1;
}

export default function sortEntries(a, b, balances: BalanceByKey, sortingType: SortingType): 0 | 1 | -1 {
  switch (sortingType) {
    case SortingType.BalAsc:
      return sortBalAsc(a, b, balances);
    case SortingType.BalDesc:
    default:
      return sortBalDesc(a, b, balances);
  }
}
