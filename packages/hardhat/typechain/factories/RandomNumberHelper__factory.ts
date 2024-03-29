/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Signer,
  utils,
  BytesLike,
  Contract,
  ContractFactory,
  Overrides,
} from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  RandomNumberHelper,
  RandomNumberHelperInterface,
} from "../RandomNumberHelper";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_VRFCoordinator",
        type: "address",
      },
      {
        internalType: "address",
        name: "_LinkToken",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_keyHash",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "LinkToken",
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
  {
    inputs: [],
    name: "VRFCoordinator",
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "electionId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "seed",
        type: "uint256",
      },
    ],
    name: "getRandomNumber",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "getRandomResult",
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
        internalType: "uint256",
        name: "randomness",
        type: "uint256",
      },
    ],
    name: "mockFulfillRandomness",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "randomResult",
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
        name: "requestId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "randomness",
        type: "uint256",
      },
    ],
    name: "rawFulfillRandomness",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60c060405234801561001057600080fd5b5060405161032538038061032583398101604081905261002f91610072565b6001600160a01b0392831660a052911660805260035567016345785d8a00006004556100ae565b80516001600160a01b038116811461006d57600080fd5b919050565b60008060006060848603121561008757600080fd5b61009084610056565b925061009e60208501610056565b9150604084015190509250925092565b60805160a0516102556100d060003960006101340152600050506102556000f3fe608060405234801561001057600080fd5b506004361061006d5760003560e01c806333b608631461007257806342619f66146100a25780634f8e2fdf146100b95780636e68fc0a146100cc578063861be67a146100e057806394985ddd146100f3578063aea2035f14610106575b600080fd5b600154610085906001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b6100ab60055481565b604051908152602001610099565b600254610085906001600160a01b031681565b6100de6100da3660046101bd565b5050565b005b6100de6100ee3660046101df565b61011b565b6100de6101013660046101bd565b610129565b6100ab6101143660046101df565b5060055490565b6101266000826101ab565b50565b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146101a55760405162461bcd60e51b815260206004820152601f60248201527f4f6e6c7920565246436f6f7264696e61746f722063616e2066756c66696c6c00604482015260640160405180910390fd5b6100da82825b6101b68160016101f8565b6005555050565b600080604083850312156101d057600080fd5b50508035926020909101359150565b6000602082840312156101f157600080fd5b5035919050565b8082018082111561021957634e487b7160e01b600052601160045260246000fd5b9291505056fea264697066735822122080f3e39b00ce7cd6d15fdfbbbb39e98eb567831d0319b90be305be0eabd6e0d864736f6c63430008110033";

export class RandomNumberHelper__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    _VRFCoordinator: string,
    _LinkToken: string,
    _keyHash: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<RandomNumberHelper> {
    return super.deploy(
      _VRFCoordinator,
      _LinkToken,
      _keyHash,
      overrides || {}
    ) as Promise<RandomNumberHelper>;
  }
  getDeployTransaction(
    _VRFCoordinator: string,
    _LinkToken: string,
    _keyHash: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _VRFCoordinator,
      _LinkToken,
      _keyHash,
      overrides || {}
    );
  }
  attach(address: string): RandomNumberHelper {
    return super.attach(address) as RandomNumberHelper;
  }
  connect(signer: Signer): RandomNumberHelper__factory {
    return super.connect(signer) as RandomNumberHelper__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): RandomNumberHelperInterface {
    return new utils.Interface(_abi) as RandomNumberHelperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): RandomNumberHelper {
    return new Contract(address, _abi, signerOrProvider) as RandomNumberHelper;
  }
}
