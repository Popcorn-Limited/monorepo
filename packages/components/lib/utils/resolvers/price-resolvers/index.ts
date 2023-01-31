import { defi_llama, set_token, staking, pop, arrakis, univ2, vault } from "./resolvers";
import { PriceResolvers } from "./types";

export * from "./types";

export const Resolvers: PriceResolvers = {
  defi_llama,
  set_token,
  staking,
  pop,
  arrakis,
  univ2,
  vault,
  default: defi_llama,
};

export default Resolvers;

export type { PriceResolvers };
