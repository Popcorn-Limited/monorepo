import { ERC20__factory } from "@popcorn/hardhat/typechain";
import { ChainId } from "@popcorn/utils";
import { Address } from "@popcorn/utils/types";
import { BigNumber } from "ethers/lib/ethers";
import { useRpcProvider } from "@popcorn/app/hooks/useRpcProvider";
import { useCallback, useEffect, useState } from "react";

export default function useTotalTokenSupply(token: Address, chainId: ChainId) {
  const [supply, setSupply] = useState<BigNumber>(BigNumber.from("0"));

  const provider = useRpcProvider(chainId);
  const erc20 = useCallback(ERC20__factory.connect, [token, chainId, provider]);

  useEffect(() => {
    if (!token) {
      return;
    }
    erc20(token, provider)
      .totalSupply()
      .then((res) => {
        setSupply(res);
      });
  }, [token]);

  return supply;
}
