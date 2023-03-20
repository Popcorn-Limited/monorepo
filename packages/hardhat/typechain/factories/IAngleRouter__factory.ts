/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IAngleRouter, IAngleRouterInterface } from "../IAngleRouter";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "dest",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minCollatAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "stablecoin",
        type: "address",
      },
      {
        internalType: "address",
        name: "collateral",
        type: "address",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minStableAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "stablecoin",
        type: "address",
      },
      {
        internalType: "address",
        name: "collateral",
        type: "address",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class IAngleRouter__factory {
  static readonly abi = _abi;
  static createInterface(): IAngleRouterInterface {
    return new utils.Interface(_abi) as IAngleRouterInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IAngleRouter {
    return new Contract(address, _abi, signerOrProvider) as IAngleRouter;
  }
}
