/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  KeeperIncentivizedHelper,
  KeeperIncentivizedHelperInterface,
} from "../KeeperIncentivizedHelper";

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
  {
    inputs: [],
    name: "contractName",
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
    name: "handleKeeperIncentiveDirectCall",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "handleKeeperIncentiveModifierCall",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_rewardToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "_keeper",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_i",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "tipIncentiveDirectCall",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60a06040527fa8273fa0c5dc3fbbb238ea7a9529bd32df31c948051a4ab5b381b3fa813747c760805234801561003457600080fd5b506040516105a13803806105a1833981016040819052610053916100c3565b806001600160a01b03811661009d5760405162461bcd60e51b815260206004820152600c60248201526b5a65726f206164647265737360a01b604482015260640160405180910390fd5b600080546001600160a01b0319166001600160a01b0392909216919091179055506100f3565b6000602082840312156100d557600080fd5b81516001600160a01b03811681146100ec57600080fd5b9392505050565b60805161049461010d6000396000606101526104946000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c806375d0c0dc1461005c5780638259ab511461009557806394b6f527146100aa578063b70e634f146100bf578063f756bf59146100c7575b600080fd5b6100837f000000000000000000000000000000000000000000000000000000000000000081565b60405190815260200160405180910390f35b6100a86100a33660046103b2565b6100cf565b005b61008360008051602061043f83398151915281565b6100a86101f1565b6100a86101fe565b836001600160a01b031663095ea7b36100f560008051602061043f83398151915261020d565b6040516001600160e01b031960e084901b1681526001600160a01b039091166004820152602481018490526044016020604051808303816000875af1158015610142573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061016691906103f8565b506040516323b872dd60e01b8152336004820152306024820152604481018290526001600160a01b038516906323b872dd906064016020604051808303816000875af11580156101ba573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101de91906103f8565b506101eb8484848461021e565b50505050565b6101fc60003361029f565b565b600061020a813361029f565b50565b600061021882610311565b92915050565b61022661037f565b6040516304d855d760e11b81526001600160a01b0386811660048301528581166024830152604482018590526064820184905291909116906309b0abae90608401600060405180830381600087803b15801561028157600080fd5b505af1158015610295573d6000803e3d6000fd5b5050505050505050565b6102a761037f565b60405163c4b405bb60e01b815260ff841660048201526001600160a01b038381166024830152919091169063c4b405bb90604401600060405180830381600087803b1580156102f557600080fd5b505af1158015610309573d6000803e3d6000fd5b505050505050565b60008054604051631c2d8fb360e31b8152600481018490526001600160a01b039091169063e16c7d9890602401602060405180830381865afa15801561035b573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102189190610421565b600061039860008051602061043f83398151915261020d565b905090565b6001600160a01b038116811461020a57600080fd5b600080600080608085870312156103c857600080fd5b84356103d38161039d565b935060208501356103e38161039d565b93969395505050506040820135916060013590565b60006020828403121561040a57600080fd5b8151801515811461041a57600080fd5b9392505050565b60006020828403121561043357600080fd5b815161041a8161039d56fe35ed2e1befd3b2dcf1ec7a6834437fa3212881ed81fd3a13dc97c3438896e1baa264697066735822122031458b767cc85f0e30f4f99b469b0bd5d0e1fca0bef611e32068d6df6c9d369464736f6c63430008110033";

export class KeeperIncentivizedHelper__factory extends ContractFactory {
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
  ): Promise<KeeperIncentivizedHelper> {
    return super.deploy(
      _contractRegistry,
      overrides || {}
    ) as Promise<KeeperIncentivizedHelper>;
  }
  getDeployTransaction(
    _contractRegistry: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_contractRegistry, overrides || {});
  }
  attach(address: string): KeeperIncentivizedHelper {
    return super.attach(address) as KeeperIncentivizedHelper;
  }
  connect(signer: Signer): KeeperIncentivizedHelper__factory {
    return super.connect(signer) as KeeperIncentivizedHelper__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): KeeperIncentivizedHelperInterface {
    return new utils.Interface(_abi) as KeeperIncentivizedHelperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): KeeperIncentivizedHelper {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as KeeperIncentivizedHelper;
  }
}