import { BigNumber, constants } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { getComponents, getRequiredComponentUnitsForIssue } from "@popcorn/greenfield-app/lib/SetProtocol";
import { resolve_price } from "../../price-resolvers/resolve_price";
import { resolve_apy } from "../resolve_apy";

export async function set_token(address, chainId, rpc): Promise<{ value: BigNumber; decimals: number }> {
  const components = await getComponents({ address, rpc });

  const quantities = await getRequiredComponentUnitsForIssue({ address, rpc });

  const apys = await Promise.all(
    components.map(async (component) => {
      const { value } = await resolve_apy({ address: component, chainId, rpc });
      return [component, value];
    }),
  );

  const prices = await Promise.all(
    components.map(async (component) => [component, await resolve_price({ address: component, chainId, rpc })]),
  );

  const componentValues = prices.reduce((acc, [component, price]) => {
    const value = price.value.mul(quantities[component]).div(parseEther("1"));
    return {
      ...acc,
      [component]: value,
      total: acc?.total ? acc.total.add(value) : value,
    };
  }, {});

  const apy = apys.reduce(
    (acc, [component, apy], index) =>
      acc.add(componentValues[component].mul(apy).div(componentValues.total).mul(parseUnits("1", 2))),
    parseEther("0"),
  );

  return { value: apy, decimals: 18 };
}
export default set_token;
