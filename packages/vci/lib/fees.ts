import { BigNumber, constants, utils } from "ethers";
import { atomWithStorage } from "jotai/utils";
import { InitParam, InitParamRequirement } from "./adapter";

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


export const validateBigNumberInput = (value?: string | number) => {
  const formatted = value === "." ? "0" : (`${value || "0"}`.replace(/\.$/, ".0") as any);
  return {
    formatted,
    isValid: value === "" || isFinite(Number(formatted)),
  };
};
