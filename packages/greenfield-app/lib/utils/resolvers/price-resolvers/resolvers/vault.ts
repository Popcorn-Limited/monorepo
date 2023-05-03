import { BigNumber, Contract, constants } from "ethers";
import { ChainId } from "@popcorn/greenfield-app/lib/utils/connectors";
import { defi_llama } from "./llama";
import { parseUnits } from "ethers/lib/utils.js";

const ZERO = constants.Zero;
export const vault = async (address: string, chainId: ChainId, rpc) => {
  const vault = new Contract(
    address,
    [
      "function asset() external view returns (address)",
      "function totalAssets() external view returns (uint256)",
      "function totalSupply() external view returns (uint256)",
      "function decimals() public view returns (uint8)",
    ],
    rpc,
  );

  const [asset, totalAssets, totalSupply, decimals]: [string, BigNumber, BigNumber, number] = await Promise.all([
    vault.asset(),
    vault.totalAssets(),
    vault.totalSupply(),
    vault.decimals(),
  ]);

  let shareRate = ZERO;
  try {
    shareRate = totalAssets.mul(parseUnits(String(decimals))).div(totalSupply);
  } catch (_) {}

  // use llama to fetch price and multiply by `shareRate`
  const llamaTokenPrice = await defi_llama(asset, chainId);
  const { value: tokenPrice } = llamaTokenPrice;

  const value = ZERO.add(tokenPrice.mul(shareRate).div(parseUnits(String(decimals))));

  return { value, decimals };
};
