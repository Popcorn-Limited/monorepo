import { JsonRpcProvider } from "@ethersproject/providers";
import { ethers } from "ethers";
import { Receipt } from "@anthonymartin/hardhat-deploy/types";

export const getCreatedProposalId = async (receit: Receipt, provider: JsonRpcProvider): Promise<number> => {
  if (!receit.transactionHash) {
    throw new Error("Invalid transaction hash");
  }
  const abi = [
    "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, address indexed beneficiary, string applicationCid)",
  ];
  const iface = new ethers.utils.Interface(abi);

  const topic = ethers.utils.id("ProposalCreated(uint256,address,address,string)");
  const logs = (
    await provider.getLogs({
      fromBlock: receit.blockNumber,
      toBlock: receit.blockNumber,
      topics: [topic],
    })
  ).filter((log) => log.transactionHash === receit.transactionHash);

  const parsed = iface.parseLog(logs[logs.length - 1]);
  return parsed.args[0].toNumber();
};
export default getCreatedProposalId;
