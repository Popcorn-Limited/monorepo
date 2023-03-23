import { atomWithStorage } from "jotai/utils";
import { InitParam } from "./adapter";
import strategies from "./constants/strategies.json";

const STRATEGY = {
  name: "Strategy",
  key: "strategy",
  description: "Strategy",
  compatibleAdapters: [],
}

export type Strategy = {
  name: string;
  key: string;
  description: string;
  compatibleAdapters: string[];
  initParams?: InitParam[];
}

export const useStrategies = () => {
  return strategies as any as Array<Strategy>;
};

export const strategyAtom = atomWithStorage<Strategy>("select.strategy", STRATEGY);
