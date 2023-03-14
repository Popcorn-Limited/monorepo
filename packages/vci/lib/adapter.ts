import { ethers } from "ethers";
import { atomWithStorage } from "jotai/utils";
import adapters from "./constants/adapters.json";

export type Adapter = {
  name: string;
  key: string;
  logoURI: string;
  protocol: string;
  initParams?: InitParam[];
};

export type InitParam = {
  name: string,
  type: ethers.utils.ParamType,
  requirements?: InitParamRequirement[],
  description?: string,
}

export enum InitParamRequirement {
  "Required",
  "NotAddressZero",
  "NotZero",
}

export const useAdapters = () => {
  return adapters as any as Array<Adapter>;
};

export const adapterAtom = atomWithStorage<Adapter>("select.adapter", adapters[0] as unknown as Adapter);
export const adapterConfigAtom = atomWithStorage<Array<string>>("config.adapter", [""]);
