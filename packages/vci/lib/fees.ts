import { BigNumber, constants } from "ethers";
import { atomWithStorage } from "jotai/utils";

export type VaultFees = {
  deposit: BigNumber;
  withdrawal: BigNumber;
  performance: BigNumber;
  management: BigNumber;
  recipient: string;
}

const DEFAULT_FEES = {
  deposit: BigNumber.from(0),
  withdrawal: BigNumber.from(0),
  performance: BigNumber.from(0),
  management: BigNumber.from(0),
  recipient: constants.AddressZero
}

export const feeAtom = atomWithStorage<VaultFees>("config.fees", DEFAULT_FEES);
