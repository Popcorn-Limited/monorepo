/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Signer,
  utils,
  BigNumberish,
  Contract,
  ContractFactory,
  Overrides,
} from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { MockERC20, MockERC20Interface } from "../MockERC20";

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_symbol",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "_decimals",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "__decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
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
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
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
    name: "balanceOf",
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
        name: "from_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
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
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040526005805460ff191660121790553480156200001e57600080fd5b5060405162000dd438038062000dd4833981016040819052620000419162000146565b828260036200005183826200025a565b5060046200006082826200025a565b50506005805460ff191660ff93909316929092179091555062000326915050565b634e487b7160e01b600052604160045260246000fd5b600082601f830112620000a957600080fd5b81516001600160401b0380821115620000c657620000c662000081565b604051601f8301601f19908116603f01168101908282118183101715620000f157620000f162000081565b816040528381526020925086838588010111156200010e57600080fd5b600091505b8382101562000132578582018301518183018401529082019062000113565b600093810190920192909252949350505050565b6000806000606084860312156200015c57600080fd5b83516001600160401b03808211156200017457600080fd5b620001828783880162000097565b945060208601519150808211156200019957600080fd5b50620001a88682870162000097565b925050604084015160ff81168114620001c057600080fd5b809150509250925092565b600181811c90821680620001e057607f821691505b6020821081036200020157634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200025557600081815260208120601f850160051c81016020861015620002305750805b601f850160051c820191505b8181101562000251578281556001016200023c565b5050505b505050565b81516001600160401b0381111562000276576200027662000081565b6200028e81620002878454620001cb565b8462000207565b602080601f831160018114620002c65760008415620002ad5750858301515b600019600386901b1c1916600185901b17855562000251565b600085815260208120601f198616915b82811015620002f757888601518255948401946001909101908401620002d6565b5085821015620003165787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b610a9e80620003366000396000f3fe608060405234801561001057600080fd5b50600436106100ca5760003560e01c806370a082311161007c57806370a08231146101765780638ea2da7d1461019f57806395d89b41146101ac5780639dc29fac146101b4578063a457c2d7146101c7578063a9059cbb146101da578063dd62ed3e146101ed57600080fd5b806306fdde03146100cf578063095ea7b3146100ed57806318160ddd1461011057806323b872dd14610122578063313ce56714610135578063395093511461014e57806340c10f1914610161575b600080fd5b6100d7610200565b6040516100e491906108c8565b60405180910390f35b6101006100fb366004610932565b610292565b60405190151581526020016100e4565b6002545b6040519081526020016100e4565b61010061013036600461095c565b6102ac565b60055460ff165b60405160ff90911681526020016100e4565b61010061015c366004610932565b6102d0565b61017461016f366004610932565b6102f2565b005b610114610184366004610998565b6001600160a01b031660009081526020819052604090205490565b60055461013c9060ff1681565b6100d7610300565b6101746101c2366004610932565b61030f565b6101006101d5366004610932565b610319565b6101006101e8366004610932565b610399565b6101146101fb3660046109ba565b6103a7565b60606003805461020f906109ed565b80601f016020809104026020016040519081016040528092919081815260200182805461023b906109ed565b80156102885780601f1061025d57610100808354040283529160200191610288565b820191906000526020600020905b81548152906001019060200180831161026b57829003601f168201915b5050505050905090565b6000336102a08185856103d2565b60019150505b92915050565b6000336102ba8582856104f7565b6102c5858585610571565b506001949350505050565b6000336102a08185856102e383836103a7565b6102ed9190610a27565b6103d2565b6102fc8282610703565b5050565b60606004805461020f906109ed565b6102fc82826107b0565b6000338161032782866103a7565b90508381101561038c5760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b60648201526084015b60405180910390fd5b6102c582868684036103d2565b6000336102a0818585610571565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b6001600160a01b0383166104345760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b6064820152608401610383565b6001600160a01b0382166104955760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b6064820152608401610383565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591015b60405180910390a3505050565b600061050384846103a7565b9050600019811461056b578181101561055e5760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e63650000006044820152606401610383565b61056b84848484036103d2565b50505050565b6001600160a01b0383166105d55760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b6064820152608401610383565b6001600160a01b0382166106375760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b6064820152608401610383565b6001600160a01b038316600090815260208190526040902054818110156106af5760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b6064820152608401610383565b6001600160a01b0384811660008181526020818152604080832087870390559387168083529184902080548701905592518581529092600080516020610a49833981519152910160405180910390a361056b565b6001600160a01b0382166107595760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f2061646472657373006044820152606401610383565b806002600082825461076b9190610a27565b90915550506001600160a01b03821660008181526020818152604080832080548601905551848152600080516020610a49833981519152910160405180910390a35050565b6001600160a01b0382166108105760405162461bcd60e51b815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f206164647265736044820152607360f81b6064820152608401610383565b6001600160a01b038216600090815260208190526040902054818110156108845760405162461bcd60e51b815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e604482015261636560f01b6064820152608401610383565b6001600160a01b038316600081815260208181526040808320868603905560028054879003905551858152919291600080516020610a4983398151915291016104ea565b600060208083528351808285015260005b818110156108f5578581018301518582016040015282016108d9565b506000604082860101526040601f19601f8301168501019250505092915050565b80356001600160a01b038116811461092d57600080fd5b919050565b6000806040838503121561094557600080fd5b61094e83610916565b946020939093013593505050565b60008060006060848603121561097157600080fd5b61097a84610916565b925061098860208501610916565b9150604084013590509250925092565b6000602082840312156109aa57600080fd5b6109b382610916565b9392505050565b600080604083850312156109cd57600080fd5b6109d683610916565b91506109e460208401610916565b90509250929050565b600181811c90821680610a0157607f821691505b602082108103610a2157634e487b7160e01b600052602260045260246000fd5b50919050565b808201808211156102a657634e487b7160e01b600052601160045260246000fdfeddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa264697066735822122093bd283ad4c7f4321609eada5fd4c9026bb8570a490e28a4873ec7c0aa8c6e5464736f6c63430008110033";

export class MockERC20__factory extends ContractFactory {
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
    _name: string,
    _symbol: string,
    _decimals: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<MockERC20> {
    return super.deploy(
      _name,
      _symbol,
      _decimals,
      overrides || {}
    ) as Promise<MockERC20>;
  }
  getDeployTransaction(
    _name: string,
    _symbol: string,
    _decimals: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _name,
      _symbol,
      _decimals,
      overrides || {}
    );
  }
  attach(address: string): MockERC20 {
    return super.attach(address) as MockERC20;
  }
  connect(signer: Signer): MockERC20__factory {
    return super.connect(signer) as MockERC20__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockERC20Interface {
    return new utils.Interface(_abi) as MockERC20Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MockERC20 {
    return new Contract(address, _abi, signerOrProvider) as MockERC20;
  }
}
