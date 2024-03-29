/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  ContractRegistry,
  ContractRegistryInterface,
} from "../ContractRegistry";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IACLRegistry",
        name: "_aclRegistry",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "_name",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "_address",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "_version",
        type: "bytes32",
      },
    ],
    name: "ContractAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "_name",
        type: "bytes32",
      },
    ],
    name: "ContractDeleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "_name",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "_address",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "_version",
        type: "bytes32",
      },
    ],
    name: "ContractUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "aclRegistry",
    outputs: [
      {
        internalType: "contract IACLRegistry",
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
        internalType: "bytes32",
        name: "_name",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_version",
        type: "bytes32",
      },
    ],
    name: "addContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "contractAddresses",
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
        name: "",
        type: "uint256",
      },
    ],
    name: "contractNames",
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
        name: "",
        type: "bytes32",
      },
    ],
    name: "contracts",
    outputs: [
      {
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "version",
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
        name: "_name",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "_contractIndex",
        type: "uint256",
      },
    ],
    name: "deleteContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_name",
        type: "bytes32",
      },
    ],
    name: "getContract",
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
        internalType: "address",
        name: "_contractAddress",
        type: "address",
      },
    ],
    name: "getContractIdFromAddress",
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
    name: "getContractNames",
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
        name: "_name",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_newAddress",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_version",
        type: "bytes32",
      },
    ],
    name: "updateContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50604051610b18380380610b1883398101604081905261002f91610143565b600080546001600160a01b03199081166001600160a01b0393841690811783556040805180820182528281527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660208083019182527f15fa0125f52e5705da1148bfcf00974823c4381bee4314203ede255f9477b73e808852600180835293517f7361e8ccf7a27163a98e050d746a5c73d23616ea599eb9af9e4a86e96a9dfc088054909816991698909817909555517f7361e8ccf7a27163a98e050d746a5c73d23616ea599eb9af9e4a86e96a9dfc095591845260029092529082208390556003805491820181559091527fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b0155610173565b60006020828403121561015557600080fd5b81516001600160a01b038116811461016c57600080fd5b9392505050565b610996806101826000396000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c8063c644275211610066578063c644275214610142578063d5a161091461016b578063e16c7d981461017e578063ec56a373146101a7578063fe3c458e146101f957600080fd5b806334d40a8f146100a357806337df1e9d146100b85780633ca6bb92146100d65780634661ac95146100f75780639160380e14610117575b600080fd5b6100b66100b13660046107b8565b61020c565b005b6100c061039e565b6040516100cd91906107ed565b60405180910390f35b6100e96100e4366004610831565b6103f6565b6040519081526020016100cd565b6100e961010536600461084a565b60026020526000908152604090205481565b60005461012a906001600160a01b031681565b6040516001600160a01b0390911681526020016100cd565b6100e961015036600461084a565b6001600160a01b031660009081526002602052604090205490565b6100b661017936600461086c565b610417565b61012a61018c366004610831565b6000908152600160205260409020546001600160a01b031690565b6101da6101b5366004610831565b600160208190526000918252604090912080549101546001600160a01b039091169082565b604080516001600160a01b0390931683526020830191909152016100cd565b6100b66102073660046107b8565b6105db565b60005460405163d09a20c560e01b81526001600160a01b039091169063d09a20c59061024c9060008051602061094183398151915290339060040161088e565b60006040518083038186803b15801561026457600080fd5b505afa158015610278573d6000803e3d6000fd5b5050506000848152600160205260409020546001600160a01b031690506102ba5760405162461bcd60e51b81526004016102b1906108a5565b60405180910390fd5b6001600160a01b038216600090815260026020526040902054156102f05760405162461bcd60e51b81526004016102b1906108d4565b600083815260016020818152604080842080546001600160a01b0390811686526002808552838720879055835180850185528983168082528187018a81528c8a52888852915185546001600160a01b0319169416939093178455519290950191909155845291905290819020849055517fb69768dcac5758cdbac4aa0c3113c765359474832ce059d53f5e799e0922db6f906103919085908590859061090b565b60405180910390a1505050565b606060038054806020026020016040519081016040528092919081815260200182805480156103ec57602002820191906000526020600020905b8154815260200190600101908083116103d8575b5050505050905090565b6003818154811061040657600080fd5b600091825260209091200154905081565b60005460405163d09a20c560e01b81526001600160a01b039091169063d09a20c5906104579060008051602061094183398151915290339060040161088e565b60006040518083038186803b15801561046f57600080fd5b505afa158015610483573d6000803e3d6000fd5b5050506000838152600160205260409020546001600160a01b031690506104bc5760405162461bcd60e51b81526004016102b1906108a5565b81600382815481106104d0576104d061092a565b90600052602060002001541461053d5760405162461bcd60e51b815260206004820152602c60248201527f74686973206973206e6f742074686520636f6e747261637420796f752061726560448201526b103637b7b5b4b733903337b960a11b60648201526084016102b1565b600082815260016020818152604080842080546001600160a01b03168552600283529084208490558584529082905280546001600160a01b0319168155015560038054829081106105905761059061092a565b90600052602060002001600090557ffcb9b89d9fdad6183290641024092e3a078212303eda7df8d64648902cd7600b826040516105cf91815260200190565b60405180910390a15050565b60005460405163d09a20c560e01b81526001600160a01b039091169063d09a20c59061061b9060008051602061094183398151915290339060040161088e565b60006040518083038186803b15801561063357600080fd5b505afa158015610647573d6000803e3d6000fd5b5050506000848152600160205260409020546001600160a01b03161590506106ab5760405162461bcd60e51b8152602060048201526017602482015276636f6e747261637420616c72656164792065786973747360481b60448201526064016102b1565b6001600160a01b038216600090815260026020526040902054156106e15760405162461bcd60e51b81526004016102b1906108d4565b6040805180820182526001600160a01b03848116808352602080840186815260008981526001808452878220965187546001600160a01b0319169616959095178655905194840194909455908352600290528282208690556003805491820181559091527fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b01849055517f41f0868602f01af184ca25746dd5d2fff355679ad1861385cf8bd3f6d3da8a57906103919085908590859061090b565b80356001600160a01b03811681146107b357600080fd5b919050565b6000806000606084860312156107cd57600080fd5b833592506107dd6020850161079c565b9150604084013590509250925092565b6020808252825182820181905260009190848201906040850190845b8181101561082557835183529284019291840191600101610809565b50909695505050505050565b60006020828403121561084357600080fd5b5035919050565b60006020828403121561085c57600080fd5b6108658261079c565b9392505050565b6000806040838503121561087f57600080fd5b50508035926020909101359150565b9182526001600160a01b0316602082015260400190565b60208082526015908201527418dbdb9d1c9858dd08191bd95cdb9d08195e1a5cdd605a1b604082015260600190565b6020808252601f908201527f636f6e7472616374206164647265737320616c726561647920696e2075736500604082015260600190565b9283526001600160a01b03919091166020830152604082015260600190565b634e487b7160e01b600052603260045260246000fdfed0a4ad96d49edb1c33461cebc6fb2609190f32c904e3c3f5877edb4488dee91ea2646970667358221220263ce033ee077496b7b77fa3fb538e615be268ba68e11eb697e00ba95995eaf364736f6c63430008110033";

export class ContractRegistry__factory extends ContractFactory {
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
    _aclRegistry: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractRegistry> {
    return super.deploy(
      _aclRegistry,
      overrides || {}
    ) as Promise<ContractRegistry>;
  }
  getDeployTransaction(
    _aclRegistry: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_aclRegistry, overrides || {});
  }
  attach(address: string): ContractRegistry {
    return super.attach(address) as ContractRegistry;
  }
  connect(signer: Signer): ContractRegistry__factory {
    return super.connect(signer) as ContractRegistry__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ContractRegistryInterface {
    return new utils.Interface(_abi) as ContractRegistryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ContractRegistry {
    return new Contract(address, _abi, signerOrProvider) as ContractRegistry;
  }
}
