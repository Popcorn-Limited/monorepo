import { ContractReceipt } from "@ethersproject/contracts";
import { ethers } from "ethers";

export const getCreatedSetTokenAddress = async (
  receipt: ContractReceipt | undefined
): Promise<string> => {
  if (!receipt) {
    throw new Error("Invalid transaction hash");
  }

  const abi = [
    "event SetTokenCreated(address indexed _setToken, address _manager, string _name, string _symbol)",
  ];
  const iface = new ethers.utils.Interface(abi);

  const topic = ethers.utils.id(
    "SetTokenCreated(address,address,string,string)"
  );

  const parsed = iface.parseLog(receipt.logs[receipt.logs.length - 1]);
  return parsed.args[0];
};
export default getCreatedSetTokenAddress;
