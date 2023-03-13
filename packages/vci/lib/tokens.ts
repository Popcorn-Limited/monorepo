import tokens from "./constants/tokenList.json";

export type Token = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
};

export const useTokenList = () => {
  return tokens.tokens;
};
