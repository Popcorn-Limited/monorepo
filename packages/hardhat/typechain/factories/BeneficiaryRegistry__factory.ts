/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  BeneficiaryRegistry,
  BeneficiaryRegistryInterface,
} from "../BeneficiaryRegistry";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IContractRegistry",
        name: "_contractRegistry",
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
        indexed: true,
        internalType: "address",
        name: "_address",
        type: "address",
      },
      {
        indexed: true,
        internalType: "string",
        name: "_applicationCid",
        type: "string",
      },
    ],
    name: "BeneficiaryAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "BeneficiaryRevoked",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_account",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_region",
        type: "bytes32",
      },
      {
        internalType: "string",
        name: "_applicationCid",
        type: "string",
      },
    ],
    name: "addBeneficiary",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "beneficiaryExists",
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
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "getBeneficiary",
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
    name: "getBeneficiaryList",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "revokeBeneficiary",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50604051610d2a380380610d2a83398101604081905261002f91610054565b600080546001600160a01b0319166001600160a01b0392909216919091179055610084565b60006020828403121561006657600080fd5b81516001600160a01b038116811461007d57600080fd5b9392505050565b610c97806100936000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c806346dd6fcd1461005c578063505a1b311461007157806375e71d6d1461009a57806376d21861146100bd578063de5602bd146100d0575b600080fd5b61006f61006a3660046108f7565b6100e5565b005b61008461007f3660046108f7565b610479565b604051610091919061091b565b60405180910390f35b6100ad6100a83660046108f7565b610525565b6040519015158152602001610091565b61006f6100cb366004610969565b610583565b6100d861082a565b60405161009191906109f2565b60008054604051631c2d8fb360e31b81527f15fa0125f52e5705da1148bfcf00974823c4381bee4314203ede255f9477b73e60048201526001600160a01b039091169063e16c7d9890602401602060405180830381865afa15801561014e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101729190610a3f565b604051632474521560e21b81529091506001600160a01b038216906391d14854906101c3907f8c76b2d2fc4ae4e9d0199f96be776a295610c24a3241321fd18909fa728e1453903390600401610a5c565b602060405180830381865afa1580156101e0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102049190610a73565b806103245750604051632474521560e21b81526001600160a01b038216906391d1485490610258907fb2337fc5a2f91a6f604f756fa93a6fbbe3275be9b1ff5e177f59433ce2060bd1903390600401610a5c565b602060405180830381865afa158015610275573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102999190610a73565b801561032457506001600160a01b03828116600090815260016020819052604091829020015490516328545c0d60e01b8152918316916328545c0d916102e3913390600401610a5c565b602060405180830381865afa158015610300573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103249190610a73565b6103a55760405162461bcd60e51b815260206004820152604160248201527f4f6e6c79207468652042656e6566696369617279476f7665726e616e6365206f60448201527f7220636f756e63696c206d617920706572666f726d207468697320616374696f6064820152603760f91b608482015260a4015b60405180910390fd5b6103ae82610525565b6103ca5760405162461bcd60e51b815260040161039c90610a95565b6001600160a01b0382166000908152600160205260409020600290810154815481106103f8576103f8610ab5565b6000918252602080832090910180546001600160a01b03191690556001600160a01b0384168252600190526040812090610432828261088c565b5060006001820181905560029091018190556040516001600160a01b038416917f7b027da1a28f458aa3cefd63d63a37582e6f7e75810d158a112a7379a761aa7a91a25050565b6001600160a01b03811660009081526001602052604090208054606091906104a090610acb565b80601f01602080910402602001604051908101604052809291908181526020018280546104cc90610acb565b80156105195780601f106104ee57610100808354040283529160200191610519565b820191906000526020600020905b8154815290600101906020018083116104fc57829003601f168201915b50505050509050919050565b600254600090810361053957506000919050565b6001600160a01b03821660008181526001602052604090206002908101548154811061056757610567610ab5565b6000918252602090912001546001600160a01b03161492915050565b600054604051631c2d8fb360e31b81527f15fa0125f52e5705da1148bfcf00974823c4381bee4314203ede255f9477b73e60048201526001600160a01b039091169063e16c7d9890602401602060405180830381865afa1580156105eb573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061060f9190610a3f565b6001600160a01b031663d09a20c57f8c76b2d2fc4ae4e9d0199f96be776a295610c24a3241321fd18909fa728e1453336040518363ffffffff1660e01b815260040161065c929190610a5c565b60006040518083038186803b15801561067457600080fd5b505afa158015610688573d6000803e3d6000fd5b5061069292505050565b806106ce5760405162461bcd60e51b815260206004820152600c60248201526b10b0b8383634b1b0ba34b7b760a11b604482015260640161039c565b6106d784610525565b156106f45760405162461bcd60e51b815260040161039c90610a95565b600280546001810182556000919091527f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace0180546001600160a01b0319166001600160a01b038616179055604080516020601f8401819004028101608090810190925260608101838152909182919085908590819085018382808284376000920191909152505050908252506020810185905260025460409091019061079c90600190610b05565b90526001600160a01b0385166000908152600160205260409020815181906107c49082610b91565b5060208201516001820155604091820151600290910155516107e99083908390610c51565b604051908190038120906001600160a01b038616907fbd793e14f2ef74a7a875db560b865f09db4c686288570de877a4c9c33e6dae4790600090a350505050565b6060600280548060200260200160405190810160405280929190818152602001828054801561088257602002820191906000526020600020905b81546001600160a01b03168152600190910190602001808311610864575b5050505050905090565b50805461089890610acb565b6000825580601f106108a8575050565b601f0160209004906000526020600020908101906108c691906108c9565b50565b5b808211156108de57600081556001016108ca565b5090565b6001600160a01b03811681146108c657600080fd5b60006020828403121561090957600080fd5b8135610914816108e2565b9392505050565b600060208083528351808285015260005b818110156109485785810183015185820160400152820161092c565b506000604082860101526040601f19601f8301168501019250505092915050565b6000806000806060858703121561097f57600080fd5b843561098a816108e2565b935060208501359250604085013567ffffffffffffffff808211156109ae57600080fd5b818701915087601f8301126109c257600080fd5b8135818111156109d157600080fd5b8860208285010111156109e357600080fd5b95989497505060200194505050565b6020808252825182820181905260009190848201906040850190845b81811015610a335783516001600160a01b031683529284019291840191600101610a0e565b50909695505050505050565b600060208284031215610a5157600080fd5b8151610914816108e2565b9182526001600160a01b0316602082015260400190565b600060208284031215610a8557600080fd5b8151801515811461091457600080fd5b60208082526006908201526565786973747360d01b604082015260600190565b634e487b7160e01b600052603260045260246000fd5b600181811c90821680610adf57607f821691505b602082108103610aff57634e487b7160e01b600052602260045260246000fd5b50919050565b81810381811115610b2657634e487b7160e01b600052601160045260246000fd5b92915050565b634e487b7160e01b600052604160045260246000fd5b601f821115610b8c57600081815260208120601f850160051c81016020861015610b695750805b601f850160051c820191505b81811015610b8857828155600101610b75565b5050505b505050565b815167ffffffffffffffff811115610bab57610bab610b2c565b610bbf81610bb98454610acb565b84610b42565b602080601f831160018114610bf45760008415610bdc5750858301515b600019600386901b1c1916600185901b178555610b88565b600085815260208120601f198616915b82811015610c2357888601518255948401946001909101908401610c04565b5085821015610c415787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b818382376000910190815291905056fea264697066735822122003512f33b5ce932f85470f36782f6f735d4690dc76b70304c479d9259bd1e2c664736f6c63430008110033";

export class BeneficiaryRegistry__factory extends ContractFactory {
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
    _contractRegistry: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<BeneficiaryRegistry> {
    return super.deploy(
      _contractRegistry,
      overrides || {}
    ) as Promise<BeneficiaryRegistry>;
  }
  getDeployTransaction(
    _contractRegistry: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_contractRegistry, overrides || {});
  }
  attach(address: string): BeneficiaryRegistry {
    return super.attach(address) as BeneficiaryRegistry;
  }
  connect(signer: Signer): BeneficiaryRegistry__factory {
    return super.connect(signer) as BeneficiaryRegistry__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BeneficiaryRegistryInterface {
    return new utils.Interface(_abi) as BeneficiaryRegistryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): BeneficiaryRegistry {
    return new Contract(address, _abi, signerOrProvider) as BeneficiaryRegistry;
  }
}
