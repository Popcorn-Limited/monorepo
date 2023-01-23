import { BigNumber, ethers } from "ethers";
import { KeeperIncentiveV2 } from "../../../typechain/KeeperIncentiveV2";

interface Balance {
  rewardToken: string;
  amount: BigNumber;
  account: string;
}

interface FormattedBalance {
  rewardToken: string;
  amount: string;
  account: string;
}
export const getKeeperClaimableBalances = async (
  contract: KeeperIncentiveV2,
  keeperAddress: string,
  rewardToken?: string
): Promise<Balance[]> => {
  return getBalances(contract, keeperAddress, rewardToken);
};

export const getBalances = async (
  contract: KeeperIncentiveV2,
  keeperAddress: string,
  rewardToken?: string
): Promise<Balance[]> => {
  const accounts = await contract.getAccounts(keeperAddress);
  return accounts
    .map((account) => ({
      rewardToken: account.token,
      amount: account.balance,
      account: account.accountId,
    }))
    .filter((account) => (rewardToken ? account.rewardToken.toLowerCase() === rewardToken.toLowerCase() : true));
};

export const getKeeperClaimableTokenBalance = async (
  contract: KeeperIncentiveV2,
  keeperAddress: string,
  rewardToken: string
): Promise<BigNumber> => {
  const keeperAccounts = await contract.getAccounts(keeperAddress);
  return keeperAccounts
    .map((account) => ({
      rewardToken: account.token,
      amount: account.balance,
      account: account.accountId,
    }))
    .filter((balance) => balance.rewardToken === rewardToken)
    .reduce((sum, balance) => {
      return sum.add(balance.amount);
    }, BigNumber.from("0"));
};

export const format = (balances: Balance[]): FormattedBalance[] => {
  return balances.map((balance) => ({
    ...balance,
    amount: balance.amount.toString(),
  }));
};
