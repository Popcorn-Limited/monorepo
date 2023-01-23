import { ERC20 } from "@popcorn/hardhat/typechain";
import { ChainId } from "@popcorn/utils";
import { constants } from "ethers";
import { isAddress } from "ethers/lib/utils";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { useCallback } from "react";

export default function useApproveERC20(chainId: ChainId) {
  const { signerOrProvider, account, onContractSuccess, onContractError } = useWeb3();
  return useCallback(
    async (
      erc20: ERC20,
      spender: string,
      successMessage: string,
      successCallback?: () => void,
      finalCallback?: () => void,
    ) => {
      if (!erc20 || !account || !chainId || !signerOrProvider || !isAddress(spender) || !isAddress(erc20.address)) {
        return null;
      }
      erc20
        .approve(spender, constants.MaxUint256)
        .then((res) => onContractSuccess(res, successMessage, successCallback))
        .catch((err) => onContractError(err))
        .finally(() => finalCallback && finalCallback());
    },
    [account, chainId],
  );
}
