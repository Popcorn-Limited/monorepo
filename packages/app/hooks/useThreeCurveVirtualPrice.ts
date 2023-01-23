import { ChainId } from "@popcorn/utils";
import { BigNumber } from "ethers/lib/ethers";
import { isAddress } from "ethers/lib/utils";
import { useCallback, useMemo } from "react";
import { MockCurveThreepool__factory } from "@popcorn/hardhat/typechain/factories/MockCurveThreepool__factory";
import { useRpcProvider } from "@popcorn/app/hooks/useRpcProvider";
import useWeb3 from "@popcorn/app/hooks/useWeb3";

export default function useThreeCurveVirtualPrice(threePoolAddress: string | undefined) {
  const { signerOrProvider, account } = useWeb3();
  const rpcProvider = useRpcProvider(ChainId.Ethereum);

  const threePool = useMemo(
    () =>
      threePoolAddress && isAddress(threePoolAddress)
        ? MockCurveThreepool__factory.connect(threePoolAddress, rpcProvider)
        : undefined,
    [threePoolAddress, signerOrProvider, account],
  );

  return useCallback(async (): Promise<BigNumber | null> => {
    if (!isAddress(threePoolAddress)) {
      return null;
    }
    return await threePool.get_virtual_price();
  }, [threePoolAddress]);
}
