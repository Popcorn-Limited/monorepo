import { ChainId } from "@popcorn/utils";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { resolve_price } from "../resolve_price";

export const arrakis = async (address: string, chainId: ChainId, rpc) => {
  const vault = new Contract(
    address,
    [
      "function getUnderlyingBalances() external view returns (uint256 amount0Current, uint256 amount1Current)",
      "function totalSupply() external view returns (uint256)",
      "function token0() external view returns (address)",
      "function token1() external view returns (address)",
    ],
    rpc,
  );

  const [token0, token1] = await Promise.all([vault.token0(), vault.token1()]);

  const [token0Price, token1Price] = await Promise.all([
    resolve_price({ address: token0, chainId, rpc }),
    resolve_price({ address: token1, chainId, rpc }),
  ]);

  const [amount0Current, amount1Current] = await vault.getUnderlyingBalances();
  const totalSupply = await vault.totalSupply();

  const valueOfToken0 = token0Price.value
    .mul(parseUnits("1", 18 - token0Price.decimals))
    .mul(amount0Current.mul(parseUnits("1", 18 - token0Price.decimals)))
    .div(parseEther("1"));

  const valueOfToken1 = token1Price.value
    .mul(parseUnits("1", 18 - token1Price.decimals))
    .mul(amount1Current.mul(parseUnits("1", 18 - token1Price.decimals)))
    .div(parseEther("1"));

  const valueOfUnderlying = valueOfToken0.add(valueOfToken1);

  const pricePerShare = parseEther("1").mul(valueOfUnderlying).div(totalSupply);

  // console.log({
  //   address,
  //   token0decimals: token0Price.decimals,
  //   token1decimals: token1Price.decimals,
  //   token0Price: formatUnits(token0Price.value, token0Price.decimals),
  //   token1Price: formatUnits(token1Price.value, token1Price.decimals),
  //   valueOfToken0: formatUnits(valueOfToken0, 18),
  //   valueOfToken1: formatUnits(valueOfToken1, 18),
  //   totalSupply: formatUnits(totalSupply, 18),
  //   valueOfUnderlying: formatUnits(valueOfUnderlying, 18),
  //   pricePerShare: formatUnits(pricePerShare, 18),
  // });

  return { value: pricePerShare, decimals: 18 };
};
