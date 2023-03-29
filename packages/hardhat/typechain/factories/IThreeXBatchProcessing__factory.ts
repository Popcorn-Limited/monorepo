/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type {
  IThreeXBatchProcessing,
  IThreeXBatchProcessingInterface,
} from "../IThreeXBatchProcessing";

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
    name: "batchStorage",
    outputs: [
      {
        internalType: "contract IAbstractBatchStorage",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "batchId_",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account_",
        type: "address",
      },
    ],
    name: "claim",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "yToken",
        type: "address",
      },
    ],
    name: "componentDependencies",
    outputs: [
      {
        components: [
          {
            internalType: "contract IERC20",
            name: "lpToken",
            type: "address",
          },
          {
            internalType: "contract CurveMetapool",
            name: "utilityPool",
            type: "address",
          },
          {
            internalType: "contract IOracle",
            name: "oracle",
            type: "address",
          },
          {
            internalType: "contract CurveMetapool",
            name: "curveMetaPool",
            type: "address",
          },
          {
            internalType: "contract IAngleRouter",
            name: "angleRouter",
            type: "address",
          },
        ],
        internalType: "struct ComponentDependencies",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
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
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "account_",
        type: "address",
      },
    ],
    name: "depositForMint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
    ],
    name: "depositForRedeem",
    outputs: [],
    stateMutability: "nonpayable",
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
        name: "_valueOfComponents",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_slippage",
        type: "uint256",
      },
    ],
    name: "getMinAmountFromRedeem",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_valueOfBatch",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_valueOfComponentsPerUnit",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_slippage",
        type: "uint256",
      },
    ],
    name: "getMinAmountToMint",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "mintBatchTokens",
    outputs: [
      {
        components: [
          {
            internalType: "contract IERC20",
            name: "targetToken",
            type: "address",
          },
          {
            internalType: "contract IERC20",
            name: "sourceToken",
            type: "address",
          },
        ],
        internalType: "struct BatchTokens",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "redeemBatchTokens",
    outputs: [
      {
        components: [
          {
            internalType: "contract IERC20",
            name: "targetToken",
            type: "address",
          },
          {
            internalType: "contract IERC20",
            name: "sourceToken",
            type: "address",
          },
        ],
        internalType: "struct BatchTokens",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "slippage",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "mintBps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "redeemBps",
            type: "uint256",
          },
        ],
        internalType: "struct Slippage",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "swapToken",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
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
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "batchId_",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "amountToWithdraw_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "account_",
        type: "address",
      },
    ],
    name: "withdrawFromBatch",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "batchId_",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "amountToWithdraw_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_withdrawFor",
        type: "address",
      },
      {
        internalType: "address",
        name: "_recipient",
        type: "address",
      },
    ],
    name: "withdrawFromBatch",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class IThreeXBatchProcessing__factory {
  static readonly abi = _abi;
  static createInterface(): IThreeXBatchProcessingInterface {
    return new utils.Interface(_abi) as IThreeXBatchProcessingInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IThreeXBatchProcessing {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as IThreeXBatchProcessing;
  }
}
