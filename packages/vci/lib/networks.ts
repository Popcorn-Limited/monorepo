import { atomWithStorage } from "jotai/utils";
import { Chain } from "wagmi";
import { goerli, localhost } from "wagmi/chains";

export const networkAtom = atomWithStorage<Chain>("select.network", localhost);
