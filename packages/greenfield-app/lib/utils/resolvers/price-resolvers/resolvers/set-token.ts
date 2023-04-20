import { ChainId } from "@popcorn/utils";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { resolve_price } from "../resolve_price";
import { PriceResolver } from "../types";

export const set_token: PriceResolver = async (address: string, chainId: ChainId, rpc) => {
  const setToken = new Contract(address, ["function getComponents() external view returns (address[] memory)"], rpc);
  const basicIssuance = new Contract(
    "0xd8EF3cACe8b4907117a45B0b125c68560532F94D",
    [
      "function getRequiredComponentUnitsForIssue(address _setToken, uint256 _quantity) external view returns (address[] memory, uint256[] memory)",
    ],
    rpc,
  );
  const components = await setToken.getComponents();

  const prices = await Promise.all(
    components.map(async (component) => [component, await resolve_price({ address: component, chainId, rpc })]),
  );

  const [_components, _quantities] = await basicIssuance.getRequiredComponentUnitsForIssue(address, parseEther("1"));
  const quantities = _components.reduce((acc, component, index) => ({ ...acc, [component]: _quantities[index] }), {});

  const total = prices
    .reduce((acc, [component, price], index) => acc.add(price.value.mul(quantities[component])), parseEther("0"))
    .div(parseEther("1"));

  return { value: total, decimals: 18 };
};
