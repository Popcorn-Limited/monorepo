import { useNamedAccounts } from "@popcorn/components/lib/utils";
import {
  useErc20Read,
  useErc20BalanceOf,
  useThreeX,
  useThreeXWrite,
  useThreeXBalanceOf,
  useFoundryGenAaveV2AdapterDecimals,
  useThreeXRead,
  useErc20,
  useErc20Transfer,
  popABI,
  usePopTransfer,
  usePreparePopWrite,
  usePreparePopTransfer,
} from "../generated";
import { useAccount } from "wagmi";
import { mainnet } from "wagmi/chains";
import { useSigner } from "wagmi";
import { useCallback, useEffect, useMemo } from "react";
import { BigNumber, constants } from "ethers";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { formatAndRoundBigNumber } from "@popcorn/utils";

export default function FoundryHookExample() {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const [pop, threeX, usdc, aave] = useNamedAccounts("1", ["pop", "threeX", "usdc", "crvAave"]);

  const { data: readERC20 } = useErc20Read({
    address: pop?.address,
    functionName: "balanceOf",
    args: [address],
  });

  const { data: balanceOf } = useErc20BalanceOf({
    address: pop?.address,
    args: [address],
  });

  const { data: foundryDecimals } = useFoundryGenAaveV2AdapterDecimals({
    address: aave?.address
  });

  const { data: three3XBalance } = useThreeXBalanceOf({
    chainId: 1,
    args: [address],
  });

  const { config } = usePreparePopTransfer({
    args: ["0xaD5459EBbA9110B0a77ab2c3A7C3F300bBc0bd04", BigNumber.from(1)],
  });
  const transfer = usePopTransfer(config);

  return (
    <div>
      <button className="bg-green ml-4 mt-4" disabled={!transfer?.write} onClick={() => transfer?.write?.()}>
        Send 1 POP
      </button>

      <div>
      <p>balance of Balance: {formatAndRoundBigNumber(balanceOf, 18)}</p>
        <p>Pop Balance: {formatAndRoundBigNumber(readERC20 || constants.Zero, 18)}</p>
        <p>ThreeX Balance: {formatAndRoundBigNumber(three3XBalance || constants.Zero, 18)}</p>
      </div>
    </div>
  );
}