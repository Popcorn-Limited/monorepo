/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type {
  KeeperIncentivized,
  KeeperIncentivizedInterface,
} from "../KeeperIncentivized";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "minWithdrawalAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "incentiveVigBps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "keeperPayout",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct KeeperConfig",
        name: "oldConfig",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "minWithdrawalAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "incentiveVigBps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "keeperPayout",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct KeeperConfig",
        name: "newConfig",
        type: "tuple",
      },
    ],
    name: "KeeperConfigUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "KEEPER_INCENTIVE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class KeeperIncentivized__factory {
  static readonly abi = _abi;
  static createInterface(): KeeperIncentivizedInterface {
    return new utils.Interface(_abi) as KeeperIncentivizedInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): KeeperIncentivized {
    return new Contract(address, _abi, signerOrProvider) as KeeperIncentivized;
  }
}
