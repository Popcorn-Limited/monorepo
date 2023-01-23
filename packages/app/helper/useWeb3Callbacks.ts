import { ChainId } from "@popcorn/utils";
import { ethers } from "ethers";
import { useCallback } from "react";
import toast from "react-hot-toast";

function confirmationsPerChain(chainId: ChainId): number {
  console.log(chainId);
  switch (chainId) {
    case ChainId.Polygon:
      return 2;
    case ChainId.Hardhat:
    case ChainId.Localhost:
      return 0;
    default:
      return 1;
  }
}

export function useWeb3Callbacks(chainId: number) {
  return {
    onSuccess: useCallback(
      async (res: ethers.ContractTransaction, successMessage: string, successCallback?: () => any): Promise<void> => {
        res.wait(confirmationsPerChain(chainId)).then(async (res) => {
          toast.dismiss();
          toast.success(successMessage);
          successCallback && (await successCallback());
        });
      },
      [chainId],
    ),
    onError: useCallback(
      async (error) => {
        toast.dismiss();
        if (
          error.message === "MetaMask Tx Signature: User denied transaction signature." ||
          "Error: User denied transaction signature"
        ) {
          toast.error("Transaction was canceled");
        } else {
          toast.error(error.message.split("'")[1]);
        }
      },
      [chainId],
    ),
  };
}

export default useWeb3Callbacks;
