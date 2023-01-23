import { ERC20, ERC20__factory } from "@popcorn/hardhat/typechain";
import { useMemo } from "react";
import useWeb3 from "@popcorn/app/hooks/useWeb3";

export default function useMultipleERC20(addresses: string[] | null): ERC20[] | null {
  const { signerOrProvider } = useWeb3();
  return useMemo(
    () => (addresses ? addresses.map((address) => ERC20__factory.connect(address, signerOrProvider)) : null),
    [signerOrProvider, addresses],
  );
}
