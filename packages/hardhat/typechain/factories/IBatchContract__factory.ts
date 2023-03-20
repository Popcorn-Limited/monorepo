/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type {
  IBatchContract,
  IBatchContractInterface,
} from "../IBatchContract";

const _abi = [
  {
    inputs: [],
    name: "batchMint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "batchRedeem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "currentMintBatchId",
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
  {
    inputs: [],
    name: "currentRedeemBatchId",
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
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "batchId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "getAccountBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "getAccountBatches",
    outputs: [
      {
        internalType: "bytes32[]",
        name: "",
        type: "bytes32[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "batchId",
        type: "bytes32",
      },
    ],
    name: "getBatch",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "id",
            type: "bytes32",
          },
          {
            internalType: "enum BatchType",
            name: "batchType",
            type: "uint8",
          },
          {
            internalType: "bytes32",
            name: "batchId",
            type: "bytes32",
          },
          {
            internalType: "bool",
            name: "claimable",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "unclaimedShares",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "sourceTokenBalance",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "targetTokenBalance",
            type: "uint256",
          },
          {
            internalType: "contract IERC20",
            name: "sourceToken",
            type: "address",
          },
          {
            internalType: "contract IERC20",
            name: "targetToken",
            type: "address",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        internalType: "struct Batch",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getBatchIds",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "id",
            type: "bytes32",
          },
          {
            internalType: "enum BatchType",
            name: "batchType",
            type: "uint8",
          },
          {
            internalType: "bytes32",
            name: "batchId",
            type: "bytes32",
          },
          {
            internalType: "bool",
            name: "claimable",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "unclaimedShares",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "sourceTokenBalance",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "targetTokenBalance",
            type: "uint256",
          },
          {
            internalType: "contract IERC20",
            name: "sourceToken",
            type: "address",
          },
          {
            internalType: "contract IERC20",
            name: "targetToken",
            type: "address",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        internalType: "struct Batch",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_mintSlippage",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_redeemSlippage",
        type: "uint256",
      },
    ],
    name: "setSlippage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_tokenAddresses",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "_quantities",
        type: "uint256[]",
      },
    ],
    name: "valueOfComponents",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class IBatchContract__factory {
  static readonly abi = _abi;
  static createInterface(): IBatchContractInterface {
    return new utils.Interface(_abi) as IBatchContractInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IBatchContract {
    return new Contract(address, _abi, signerOrProvider) as IBatchContract;
  }
}
