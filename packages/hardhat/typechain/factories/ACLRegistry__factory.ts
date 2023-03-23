/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ACLRegistry, ACLRegistryInterface } from "../ACLRegistry";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    inputs: [],
    name: "APPROVED_CONTRACT_ROLE",
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
    name: "DAO_ROLE",
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
    name: "DEFAULT_ADMIN_ROLE",
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
    name: "KEEPER_ROLE",
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
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
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
        name: "permission",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantPermission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "permission",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasPermission",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "isRoleAdmin",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
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
    name: "requireApprovedContractOrEOA",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "permission",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "requirePermission",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "requireRole",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "permission",
        type: "bytes32",
      },
    ],
    name: "revokePermission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "adminRole",
        type: "bytes32",
      },
    ],
    name: "setRoleAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b503360009081527fad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb560205260409020805460ff191660011790556108f1806100596000396000f3fe608060405234801561001057600080fd5b50600436106100eb5760003560e01c8063a217fddf11610092578063a217fddf146101e5578063bc586456146101ed578063ce28a30114610200578063d09a20c514610213578063d3e2f7fd14610226578063d547741f14610239578063db47d4361461024c578063e89005c71461025f578063e9c265181461027257600080fd5b80631e4e0091146100f0578063248a9ca31461010557806328545c0d1461013b5780632f2ff15d1461015e57806331035c8214610171578063364bc15a1461019857806336568abe146101bf57806391d14854146101d2575b600080fd5b6101036100fe3660046107ee565b610299565b005b610128610113366004610810565b60009081526020819052604090206001015490565b6040519081526020015b60405180910390f35b61014e610149366004610845565b610326565b6040519015158152602001610132565b61010361016c366004610845565b610347565b6101287ffb639edf4b4a4724b8b9fb42a839b712c82108c1edf1beb051bcebce8e689dc481565b6101287f4f78afe9dfc9a0cb0441c27b9405070cd2a48b490636a7bdd09f355e33a5d7de81565b6101036101cd366004610845565b610372565b61014e6101e0366004610845565b6103f5565b610128600081565b6101036101fb366004610845565b61041e565b61010361020e366004610845565b610473565b610103610221366004610845565b6104d7565b610103610234366004610845565b61052d565b610103610247366004610845565b61058f565b61010361025a366004610871565b6105b5565b61010361026d366004610810565b61063c565b6101287fd0a4ad96d49edb1c33461cebc6fb2609190f32c904e3c3f5877edb4488dee91e81565b6000828152602081905260409020600101546102b6905b336103f5565b806102c757506102c76000336103f5565b6103185760405162461bcd60e51b815260206004820181905260248201527f63616e206f6e6c792072656e6f756e636520726f6c657320666f722073656c6660448201526064015b60405180910390fd5b6103228282610681565b5050565b600091825260016020526040909120546001600160a01b0391821691161490565b60008281526020819052604090206001015461036381336106cc565b61036d8383610722565b505050565b6001600160a01b03811633148061039f575060008281526020819052604090206001015461039f906102b0565b6103eb5760405162461bcd60e51b815260206004820152601b60248201527f796f752063616e742072656e6f756e6365207468697320726f6c650000000000604482015260640161030f565b6103228282610789565b6000918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b6104296000336103f5565b6104455760405162461bcd60e51b815260040161030f90610893565b60009182526001602052604090912080546001600160a01b0319166001600160a01b03909216919091179055565b60008281526020819052604090206001015461048f90826103f5565b6103225760405162461bcd60e51b81526020600482015260196024820152783cb7ba903430bb32903a37903132903937b6329030b236b4b760391b604482015260640161030f565b6104e182826103f5565b6103225760405162461bcd60e51b815260206004820152601c60248201527f796f7520646f6e7420686176652074686520726967687420726f6c6500000000604482015260640161030f565b6105378282610326565b6103225760405162461bcd60e51b815260206004820152602360248201527f796f7520646f6e74206861766520746865207269676874207065726d697373696044820152626f6e7360e81b606482015260840161030f565b6000828152602081905260409020600101546105ab81336106cc565b61036d8383610789565b6105df7ffb639edf4b4a4724b8b9fb42a839b712c82108c1edf1beb051bcebce8e689dc4826103f5565b806105f257506001600160a01b03811632145b6106395760405162461bcd60e51b815260206004820152601860248201527720b1b1b2b9b9903232b734b2b2103337b91031b0b63632b960411b604482015260640161030f565b50565b6106476000336103f5565b6106635760405162461bcd60e51b815260040161030f90610893565b600090815260016020526040902080546001600160a01b0319169055565b600082815260208190526040808220600101805490849055905190918391839186917fbd79b86ffe0ab8e8776151514217cd7cacd52c909f66475c3af44e129f0b00ff9190a4505050565b6106d682826103f5565b6103225760405162461bcd60e51b815260206004820152601f60248201527f796f7520646f6e7420686176652074686520726571756972656420726f6c6500604482015260640161030f565b61072c82826103f5565b610322576000828152602081815260408083206001600160a01b0385168085529252808320805460ff1916600117905551339285917f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d9190a45050565b61079382826103f5565b15610322576000828152602081815260408083206001600160a01b0385168085529252808320805460ff1916905551339285917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45050565b6000806040838503121561080157600080fd5b50508035926020909101359150565b60006020828403121561082257600080fd5b5035919050565b80356001600160a01b038116811461084057600080fd5b919050565b6000806040838503121561085857600080fd5b8235915061086860208401610829565b90509250929050565b60006020828403121561088357600080fd5b61088c82610829565b9392505050565b6020808252600e908201526d37b7363c903337b91030b236b4b760911b60408201526060019056fea264697066735822122063b433f0e2b663e9d34469fcc80ade458c4986f16ba16b235854b76fc3c8945664736f6c63430008110033";

export class ACLRegistry__factory extends ContractFactory {
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
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ACLRegistry> {
    return super.deploy(overrides || {}) as Promise<ACLRegistry>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): ACLRegistry {
    return super.attach(address) as ACLRegistry;
  }
  connect(signer: Signer): ACLRegistry__factory {
    return super.connect(signer) as ACLRegistry__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ACLRegistryInterface {
    return new utils.Interface(_abi) as ACLRegistryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ACLRegistry {
    return new Contract(address, _abi, signerOrProvider) as ACLRegistry;
  }
}
