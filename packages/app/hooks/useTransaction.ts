import { ContractTransaction } from "ethers/lib/ethers";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { useWeb3Callbacks } from "@popcorn/app//helper/useWeb3Callbacks";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { useSwitchChainModal } from "@popcorn/app/hooks/useSwitchChainModal";

type TransactionCallback = (...args) => Promise<ContractTransaction>;
type TransactionSubmitFunction = (
  callback: TransactionCallback,
  loadingMsg: string,
  successMsg: string,
  successCallback?: () => any,
) => Promise<ContractTransaction>;

export function useTransaction(chainId = 1337): TransactionSubmitFunction {
  const { onSuccess, onError } = useWeb3Callbacks(chainId);
  const { connectedChainId } = useWeb3();
  const switchChain = useSwitchChainModal(chainId, connectedChainId);

  return useCallback(
    function (
      callback: TransactionCallback,
      loadingMsg: string,
      successMsg: string,
      successCallback?: () => any,
    ): Promise<ContractTransaction> {
      if (connectedChainId !== chainId) {
        switchChain();
        return;
      }
      return transaction(callback, loadingMsg, successMsg, [onSuccess, onError], successCallback);
    },
    [connectedChainId, chainId, switchChain, onSuccess, onError],
  );
}

function transaction(
  callback: () => Promise<ContractTransaction>,
  loadingMsg: string,
  successMessage: string,
  [onSuccess, onError]: [
    (res: ContractTransaction, successMessage: string, successCallback?: () => any) => Promise<void>,
    (error: any) => Promise<void>,
  ],
  successCallback?: () => any,
): Promise<ContractTransaction> {
  return new Promise((resolve, reject) => {
    toast.loading(loadingMsg);
    return callback().then(
      (res) => {
        resolve(res);
        onSuccess(res, successMessage, successCallback);
      },
      (err) => {
        onError(err);
        reject(err);
      },
    );
  });
}
