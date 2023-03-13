import protocols from "./constants/protocolList.json";

export type Protocol = {
  chainId: string;
  address: string;
  name: string;
  logoURI: string;
};

export const useProtocolList = () => {
  return protocols as any as Array<Protocol>;
};
