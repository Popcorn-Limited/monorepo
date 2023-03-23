/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { StableSwap, StableSwapInterface } from "../StableSwap";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "i",
        type: "uint256",
      },
    ],
    name: "coins",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class StableSwap__factory {
  static readonly abi = _abi;
  static createInterface(): StableSwapInterface {
    return new utils.Interface(_abi) as StableSwapInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): StableSwap {
    return new Contract(address, _abi, signerOrProvider) as StableSwap;
  }
}
