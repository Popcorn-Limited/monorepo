import { atomWithStorage } from "jotai/utils";
import protocols from "./constants/protocols.json";

export type Protocol = {
  chains: number[];
  name: string;
  logoURI: string;
};

export const useProtocols = () => {
  return protocols as any as Array<Protocol>;
};

export const protocolAtom = atomWithStorage<Protocol>("select.protocol", protocols[0] as unknown as Protocol);
