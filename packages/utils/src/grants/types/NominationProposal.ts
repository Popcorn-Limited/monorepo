import { BigNumber } from "ethers";

export enum ProposalStatus {
  New,
  ChallengePeriod,
  PendingFinalization,
  Passed,
  Failed,
  All,
}

export enum ProposalType {
  Nomination,
  Takedown,
}

export interface Image {
  hash?: string;
  description: string;
  fileName?: string;
  image?: string;
}

export interface ImpactReport {
  fileName: string;
  reportCid?: string;
  hash: string;
}
export interface BeneficiaryApplication {
  organizationName: string;
  projectName?: string;
  missionStatement: string;
  beneficiaryAddress: string;
  proposalCategory: string;
  files: {
    profileImage: Image;
    headerImage?: Image;
    impactReports?: ImpactReport[];
    additionalImages?: Image[];
    video: string;
  };
  links: {
    telegramUrl?: string;
    signalUrl?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    githubUrl?: string;
    proofOfOwnership?: string;
    contactEmail: string;
    website: string;
  };
  version: string;
}
export interface Proposal {
  application: BeneficiaryApplication;
  id: string;
  status: ProposalStatus;
  stageDeadline: Date;
  proposalType: ProposalType;
  startTime?: Date;
  votes: {
    for: BigNumber;
    against: BigNumber;
  };
}
