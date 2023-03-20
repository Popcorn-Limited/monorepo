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
import type {
  MockCurveFactoryMetapool,
  MockCurveFactoryMetapoolInterface,
} from "../MockCurveFactoryMetapool";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract MockERC20",
        name: "tokenA_",
        type: "address",
      },
      {
        internalType: "contract MockERC20",
        name: "threeCrv_",
        type: "address",
      },
      {
        internalType: "contract MockERC20[3]",
        name: "baseCoins_",
        type: "address[3]",
      },
      {
        internalType: "uint256",
        name: "_forexPrice",
        type: "uint256",
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
        internalType: "uint256[4]",
        name: "amounts",
        type: "uint256[4]",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "add_liquidity",
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
        internalType: "uint256[2]",
        name: "amounts",
        type: "uint256[2]",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "add_liquidity",
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
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "allCoins",
    outputs: [
      {
        internalType: "contract MockERC20",
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
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "baseCoins",
    outputs: [
      {
        internalType: "contract MockERC20",
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
    inputs: [
      {
        internalType: "uint256",
        name: "_token_amount",
        type: "uint256",
      },
      {
        internalType: "int128",
        name: "",
        type: "int128",
      },
    ],
    name: "calc_withdraw_one_coin",
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
    name: "coins",
    outputs: [
      {
        internalType: "address[2]",
        name: "",
        type: "address[2]",
      },
    ],
    stateMutability: "view",
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
        internalType: "int128",
        name: "i",
        type: "int128",
      },
      {
        internalType: "int128",
        name: "j",
        type: "int128",
      },
      {
        internalType: "uint256",
        name: "dx",
        type: "uint256",
      },
    ],
    name: "exchange",
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
        internalType: "int128",
        name: "i",
        type: "int128",
      },
      {
        internalType: "int128",
        name: "j",
        type: "int128",
      },
      {
        internalType: "uint256",
        name: "dx",
        type: "uint256",
      },
    ],
    name: "exchange_underlying",
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
    inputs: [],
    name: "get_virtual_price",
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
    name: "price_oracle",
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
        name: "_token_amount",
        type: "uint256",
      },
      {
        internalType: "int128",
        name: "i",
        type: "int128",
      },
      {
        internalType: "uint256",
        name: "_min_amount",
        type: "uint256",
      },
    ],
    name: "remove_liquidity_one_coin",
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
        internalType: "uint256",
        name: "virtualPrice_",
        type: "uint256",
      },
    ],
    name: "setVirtualPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "withdrawalSlippageBps_",
        type: "uint256",
      },
    ],
    name: "setWithdrawalSlippage",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "threeCrv",
    outputs: [
      {
        internalType: "contract MockERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenA",
    outputs: [
      {
        internalType: "contract MockERC20",
        name: "",
        type: "address",
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
  "0x60806040526005805460ff19166012179055670de0b6b3a7640000600e55600a6010556127106011553480156200003557600080fd5b5060405162001d7538038062001d758339810160408190526200005891620002dc565b60408051808201825260058082526406372764c560dc1b60208084018290528451808601909552918452908301529060128282600362000099838262000422565b506004620000a8828262000422565b5050600580546001600160a01b03808b16610100026001600160a81b031990921660ff9095169490941717905550600680549187166001600160a01b031990921691909117905550620001019050600783600362000194565b50604080516080810182526001600160a01b038681168252845181166020808401919091528501518116828401529184015190911660608201526200014b90600a906004620001f1565b50600f819055604080518082019091526005546001600160a01b0361010090910481168252600654166020820152620001899060129060026200023b565b5050505050620004ee565b8260038101928215620001df579160200282015b82811115620001df57825182546001600160a01b0319166001600160a01b03909116178255602090920191600190910190620001a8565b50620001ed92915062000292565b5090565b8260048101928215620001df5791602002820182811115620001df57825182546001600160a01b0319166001600160a01b03909116178255602090920191600190910190620001a8565b828054828255906000526020600020908101928215620001df5791602002820182811115620001df57825182546001600160a01b0319166001600160a01b03909116178255602090920191600190910190620001a8565b5b80821115620001ed576000815560010162000293565b80516001600160a01b0381168114620002c157600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b60008060008060c08587031215620002f357600080fd5b620002fe85620002a9565b935060206200030f818701620002a9565b935086605f8701126200032157600080fd5b604051606081016001600160401b0381118282101715620003465762000346620002c6565b6040528060a08801898111156200035c57600080fd5b604089015b8181101562000383576200037581620002a9565b835291840191840162000361565b5051969995985090965050505050565b600181811c90821680620003a857607f821691505b602082108103620003c957634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200041d57600081815260208120601f850160051c81016020861015620003f85750805b601f850160051c820191505b81811015620004195782815560010162000404565b5050505b505050565b81516001600160401b038111156200043e576200043e620002c6565b62000456816200044f845462000393565b84620003cf565b602080601f8311600181146200048e5760008415620004755750858301515b600019600386901b1c1916600185901b17855562000419565b600085815260208120601f198616915b82811015620004bf578886015182559484019460019091019084016200049e565b5085821015620004de5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b61187780620004fe6000396000f3fe608060405234801561001057600080fd5b506004361061018f5760003560e01c806340c10f19116100e457806395d89b411161009257806395d89b41146103695780639dc29fac14610371578063a457c2d714610384578063a9059cbb14610397578063bb7b8b80146103aa578063cc2b27d7146103b2578063dd62ed3e146103c4578063e81fe140146103d757600080fd5b806340c10f19146102df57806347bf3cb1146102f2578063568784361461030557806370a082311461031857806386fc88d3146103415780638ea2da7d1461034957806395910b871461035657600080fd5b806318160ddd1161014157806318160ddd1461025d5780631a4d01d21461026557806322fcefbe1461027857806323b872dd1461028d5780632da9a694146102a0578063313ce567146102b357806339509351146102cc57600080fd5b8063029b2f341461019457806306fdde03146101ba578063095ea7b3146101cf5780630b4c7e4d146101f25780630fc63d101461020557806313143ecd1461023557806313560cac1461024a575b600080fd5b6101a76101a236600461146b565b6103ea565b6040519081526020015b60405180910390f35b6101c2610611565b6040516101b19190611499565b6101e26101dd366004611503565b6106a3565b60405190151581526020016101b1565b6101a761020036600461152d565b6106bb565b60055461021d9061010090046001600160a01b031681565b6040516001600160a01b0390911681526020016101b1565b610248610243366004611551565b600e55565b005b61021d610258366004611551565b610884565b6002546101a7565b6101a761027336600461157c565b6108a4565b610280610a76565b6040516101b191906115b1565b6101e261029b3660046115eb565b610aaa565b60065461021d906001600160a01b031681565b60055460ff165b60405160ff90911681526020016101b1565b6101e26102da366004611503565b610ace565b6102486102ed366004611503565b610af0565b6101a7610300366004611617565b610afe565b610248610313366004611551565b601055565b6101a7610326366004611643565b6001600160a01b031660009081526020819052604090205490565b600f546101a7565b6005546102ba9060ff1681565b61021d610364366004611551565b610d7c565b6101c2610d8c565b61024861037f366004611503565b610d9b565b6101e2610392366004611503565b610da5565b6101e26103a5366004611503565b610e25565b600e546101a7565b6101a76103c0366004611665565b5090565b6101a76103d2366004611691565b610e33565b6101a76103e5366004611617565b610e5e565b60008060005b60048160ff16101561058657600a8160ff1660048110610412576104126116bb565b01546001600160a01b03166323b872dd33308860ff861660048110610439576104396116bb565b60200201356040518463ffffffff1660e01b815260040161045c939291906116d1565b6020604051808303816000875af115801561047b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061049f91906116f5565b506000858260ff16600481106104b7576104b76116bb565b60200201359050600a8260ff16600481106104d4576104d46116bb565b0160009054906101000a90046001600160a01b03166001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015610526573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061054a9190611717565b60ff166006036105665761056364e8d4a5100082611750565b90505b6105708184611767565b925050808061057e9061177a565b9150506103f0565b50620186a0816010546105999190611750565b6105a39190611799565b6105ad90826117bb565b6040516340c10f1960e01b815290915030906340c10f19906105d590339085906004016117ce565b600060405180830381600087803b1580156105ef57600080fd5b505af1158015610603573d6000803e3d6000fd5b509293505050505b92915050565b606060038054610620906117e7565b80601f016020809104026020016040519081016040528092919081815260200182805461064c906117e7565b80156106995780601f1061066e57610100808354040283529160200191610699565b820191906000526020600020905b81548152906001019060200180831161067c57829003601f168201915b5050505050905090565b6000336106b1818585610f57565b5060019392505050565b60008060005b60125460ff8216101561085e5760128160ff16815481106106e4576106e46116bb565b6000918252602090912001546001600160a01b03166323b872dd33308860ff861660028110610715576107156116bb565b60200201356040518463ffffffff1660e01b8152600401610738939291906116d1565b6020604051808303816000875af1158015610757573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061077b91906116f5565b506000858260ff1660028110610793576107936116bb565b6020020135905060128260ff16815481106107b0576107b06116bb565b600091825260209182902001546040805163313ce56760e01b815290516001600160a01b039092169263313ce567926004808401938290030181865afa1580156107fe573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108229190611717565b60ff1660060361083e5761083b64e8d4a5100082611750565b90505b6108488184611767565b92505080806108569061177a565b9150506106c1565b506040516340c10f1960e01b815230906340c10f19906105d590339085906004016117ce565b600a816004811061089457600080fd5b01546001600160a01b0316905081565b6040516323b872dd60e01b815260009030906323b872dd906108ce903390849089906004016116d1565b6020604051808303816000875af11580156108ed573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061091191906116f5565b506000612710601054866109259190611750565b61092f9190611799565b9050600061093d82876117bb565b9050600a856001600160801b03166004811061095b5761095b6116bb565b0160009054906101000a90046001600160a01b03166001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa1580156109ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109d19190611717565b60ff166006036109ed576109ea64e8d4a5100082611799565b90505b600a856001600160801b031660048110610a0957610a096116bb565b01546040516340c10f1960e01b81526001600160a01b03909116906340c10f1990610a3a90339085906004016117ce565b600060405180830381600087803b158015610a5457600080fd5b505af1158015610a68573d6000803e3d6000fd5b509298975050505050505050565b610a7e61144d565b50604080518082019091526005546001600160a01b036101009091048116825260065416602082015290565b600033610ab885828561107c565b610ac38585856110f6565b506001949350505050565b6000336106b1818585610ae18383610e33565b610aeb9190611767565b610f57565b610afa8282611288565b5050565b6000600a846001600160801b031660048110610b1c57610b1c6116bb565b01546040516323b872dd60e01b81526001600160a01b03909116906323b872dd90610b4f903390309087906004016116d1565b6020604051808303816000875af1158015610b6e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b9291906116f5565b5081600a6001600160801b03861660048110610bb057610bb06116bb565b0160009054906101000a90046001600160a01b03166001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015610c02573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c269190611717565b60ff16600603610c4657610c3f64e8d4a5100082611750565b9050610cf4565b600a846001600160801b031660048110610c6257610c626116bb565b0160009054906101000a90046001600160a01b03166001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015610cb4573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610cd89190611717565b60ff16600603610cf457610cf164e8d4a5100082611799565b90505b600a846001600160801b031660048110610d1057610d106116bb565b01546040516340c10f1960e01b81526001600160a01b03909116906340c10f1990610d4190339085906004016117ce565b600060405180830381600087803b158015610d5b57600080fd5b505af1158015610d6f573d6000803e3d6000fd5b5092979650505050505050565b6007816003811061089457600080fd5b606060048054610620906117e7565b610afa8282611335565b60003381610db38286610e33565b905083811015610e185760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b60648201526084015b60405180910390fd5b610ac38286868403610f57565b6000336106b18185856110f6565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b6000600a846001600160801b031660048110610e7c57610e7c6116bb565b01546040516323b872dd60e01b81526001600160a01b03909116906323b872dd90610eaf903390309087906004016116d1565b6020604051808303816000875af1158015610ece573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ef291906116f5565b50600f548290670de0b6b3a764000014801590610f12575083600f0b6002145b15610f3b57670de0b6b3a7640000600f5484610f2e9190611750565b610f389190611799565b90505b600a856001600160801b031660048110610bb057610bb06116bb565b6001600160a01b038316610fb95760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b6064820152608401610e0f565b6001600160a01b03821661101a5760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b6064820152608401610e0f565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591015b60405180910390a3505050565b60006110888484610e33565b905060001981146110f057818110156110e35760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e63650000006044820152606401610e0f565b6110f08484848403610f57565b50505050565b6001600160a01b03831661115a5760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b6064820152608401610e0f565b6001600160a01b0382166111bc5760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b6064820152608401610e0f565b6001600160a01b038316600090815260208190526040902054818110156112345760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b6064820152608401610e0f565b6001600160a01b0384811660008181526020818152604080832087870390559387168083529184902080548701905592518581529092600080516020611822833981519152910160405180910390a36110f0565b6001600160a01b0382166112de5760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f2061646472657373006044820152606401610e0f565b80600260008282546112f09190611767565b90915550506001600160a01b03821660008181526020818152604080832080548601905551848152600080516020611822833981519152910160405180910390a35050565b6001600160a01b0382166113955760405162461bcd60e51b815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f206164647265736044820152607360f81b6064820152608401610e0f565b6001600160a01b038216600090815260208190526040902054818110156114095760405162461bcd60e51b815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e604482015261636560f01b6064820152608401610e0f565b6001600160a01b038316600081815260208181526040808320868603905560028054879003905551858152919291600080516020611822833981519152910161106f565b60405180604001604052806002906020820280368337509192915050565b60008060a0838503121561147e57600080fd5b608083018481111561148f57600080fd5b9294923593505050565b600060208083528351808285015260005b818110156114c6578581018301518582016040015282016114aa565b506000604082860101526040601f19601f8301168501019250505092915050565b80356001600160a01b03811681146114fe57600080fd5b919050565b6000806040838503121561151657600080fd5b61151f836114e7565b946020939093013593505050565b6000806060838503121561154057600080fd5b604083018481111561148f57600080fd5b60006020828403121561156357600080fd5b5035919050565b8035600f81900b81146114fe57600080fd5b60008060006060848603121561159157600080fd5b833592506115a16020850161156a565b9150604084013590509250925092565b60408101818360005b60028110156115e25781516001600160a01b03168352602092830192909101906001016115ba565b50505092915050565b60008060006060848603121561160057600080fd5b611609846114e7565b92506115a1602085016114e7565b60008060006060848603121561162c57600080fd5b6116358461156a565b92506115a16020850161156a565b60006020828403121561165557600080fd5b61165e826114e7565b9392505050565b6000806040838503121561167857600080fd5b823591506116886020840161156a565b90509250929050565b600080604083850312156116a457600080fd5b6116ad836114e7565b9150611688602084016114e7565b634e487b7160e01b600052603260045260246000fd5b6001600160a01b039384168152919092166020820152604081019190915260600190565b60006020828403121561170757600080fd5b8151801515811461165e57600080fd5b60006020828403121561172957600080fd5b815160ff8116811461165e57600080fd5b634e487b7160e01b600052601160045260246000fd5b808202811582820484141761060b5761060b61173a565b8082018082111561060b5761060b61173a565b600060ff821660ff81036117905761179061173a565b60010192915050565b6000826117b657634e487b7160e01b600052601260045260246000fd5b500490565b8181038181111561060b5761060b61173a565b6001600160a01b03929092168252602082015260400190565b600181811c908216806117fb57607f821691505b60208210810361181b57634e487b7160e01b600052602260045260246000fd5b5091905056feddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa26469706673582212205b09d35232ac129eedb544a9e4bf989d87544fca777ebb5dc2f05d2aa2c2084c64736f6c63430008110033";

export class MockCurveFactoryMetapool__factory extends ContractFactory {
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
    tokenA_: string,
    threeCrv_: string,
    baseCoins_: [string, string, string],
    _forexPrice: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<MockCurveFactoryMetapool> {
    return super.deploy(
      tokenA_,
      threeCrv_,
      baseCoins_,
      _forexPrice,
      overrides || {}
    ) as Promise<MockCurveFactoryMetapool>;
  }
  getDeployTransaction(
    tokenA_: string,
    threeCrv_: string,
    baseCoins_: [string, string, string],
    _forexPrice: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      tokenA_,
      threeCrv_,
      baseCoins_,
      _forexPrice,
      overrides || {}
    );
  }
  attach(address: string): MockCurveFactoryMetapool {
    return super.attach(address) as MockCurveFactoryMetapool;
  }
  connect(signer: Signer): MockCurveFactoryMetapool__factory {
    return super.connect(signer) as MockCurveFactoryMetapool__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockCurveFactoryMetapoolInterface {
    return new utils.Interface(_abi) as MockCurveFactoryMetapoolInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MockCurveFactoryMetapool {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as MockCurveFactoryMetapool;
  }
}
