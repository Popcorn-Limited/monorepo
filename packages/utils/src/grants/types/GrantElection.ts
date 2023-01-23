import { BigNumber } from "ethers/lib/ethers";

export enum ElectionTerm {
  Monthly,
  Quarterly,
  Yearly,
}

export enum ElectionState {
  Registration,
  Voting,
  Closed,
  FinalizationProposed,
  Finalized,
}

export enum ShareType {
  EqualWeight,
  DynamicWeight,
}

interface Vote {
  voter: string;
  beneficiary: string;
  weight: BigNumber;
}

export const ElectionTermIntToName = {
  0: "monthly",
  1: "quarterly",
  2: "yearly",
};

type ElectionStateString = "registration" | "voting" | "closed" | "finalized";
interface ElectionStateMap {
  [key: number]: ElectionStateString;
}
export const ElectionStateIntToName: ElectionStateMap = {
  0: "registration",
  1: "voting",
  2: "closed",
  3: "finalized",
};

export interface BondRequirements {
  required: boolean;
  amount: BigNumber;
}

export interface ElectionMetadata {
  votes: Vote[];
  electionTerm: ElectionTerm;
  registeredBeneficiaries: string[];
  electionState: ElectionState;
  electionStateStringShort: ElectionStateString;
  electionStateStringLong: string;
  configuration: {
    awardees: number;
    ranking: number;
  };
  useChainlinkVRF: boolean;
  periods: {
    cooldownPeriod: number;
    registrationPeriod: number;
    votingPeriod: number;
  };
  startTime: number;
  bondRequirements: BondRequirements;
  shareType: ShareType;
  randomNumber: number;
}

export type ElectionPeriod = "voting" | "registration" | "closed" | "finalized";
