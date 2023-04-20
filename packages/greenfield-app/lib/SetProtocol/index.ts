import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils.js";

export const getComponents = async ({ address, rpc }) => {
  const setToken = new Contract(address, ["function getComponents() external view returns (address[] memory)"], rpc);
  return setToken.getComponents();
};

export const getRequiredComponentUnitsForIssue = async ({ address, rpc }) => {
  const basicIssuance = new Contract(
    "0xd8EF3cACe8b4907117a45B0b125c68560532F94D",
    [
      "function getRequiredComponentUnitsForIssue(address _setToken, uint256 _quantity) external view returns (address[] memory, uint256[] memory)",
    ],
    rpc,
  );
  const [_components, _quantities] = await basicIssuance.getRequiredComponentUnitsForIssue(address, parseEther("1"));

  return _components.reduce((acc, component, index) => ({ ...acc, [component]: _quantities[index] }), {});
};
