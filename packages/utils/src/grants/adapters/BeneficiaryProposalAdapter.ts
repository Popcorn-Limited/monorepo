import { IIpfsClient } from "../../IpfsClient";
import { Contract } from "ethers";
import { Proposal, ProposalType } from "../types";
export class BeneficiaryGovernanceAdapter {
  constructor(private contract: Contract, private IpfsClient: IIpfsClient) {}

  public async getProposal(id: number): Promise<Proposal> {
    const proposal = await this.contract.proposals(id);
    return {
      application: await this.IpfsClient.get(proposal.applicationCid),
      id: id.toString(),
      proposalType: proposal.proposalType,
      status: Number(proposal.status.toString()),
      startTime: new Date(Number(proposal.startTime.toString()) * 1000),
      stageDeadline: new Date(
        (Number(proposal.startTime.toString()) +
          Number(proposal.configurationOptions.votingPeriod.toString()) +
          Number(proposal.configurationOptions.vetoPeriod.toString())) *
          1000,
      ),
      votes: {
        for: proposal.yesCount,
        against: proposal.noCount,
      },
    };
  }

  public async getAllProposals(proposalType: ProposalType): Promise<Proposal[]> {
    const proposalCount = await this.contract.getNumberOfProposals(proposalType);
    const proposalTypeName = proposalType === ProposalType.Nomination ? "nominations" : "takedowns";

    const proposalIds = await Promise.all(
      new Array(Number(proposalCount)).fill(undefined).map(async (x, i) => {
        return this.contract[proposalTypeName](i);
      }),
    );
    return Promise.all(
      proposalIds.map(async (id) => {
        return this.getProposal(Number(id));
      }),
    );
  }

  public async hasVoted(proposalId: number, account: string): Promise<boolean> {
    return await this.contract.hasVoted(proposalId, account);
  }
}
export default BeneficiaryGovernanceAdapter;
