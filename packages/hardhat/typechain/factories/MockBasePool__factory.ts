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
import type { MockBasePool, MockBasePoolInterface } from "../MockBasePool";

const _abi = [
  {
    inputs: [
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
        internalType: "uint256[3]",
        name: "amounts",
        type: "uint256[3]",
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
  "0x60806040526005805460ff19166012179055670de0b6b3a7640000600955600a600b55612710600c553480156200003557600080fd5b506040516200190238038062001902833981016040819052620000589162000185565b60408051808201825260058082526406372764c560dc1b602080840182905284518086019095529184529083015290601282826003620000998382620002a7565b506004620000a88282620002a7565b50506005805460ff191660ff939093169290921790915550620000d3915060069050836003620000de565b50600a555062000373565b826003810192821562000129579160200282015b828111156200012957825182546001600160a01b0319166001600160a01b03909116178255602090920191600190910190620000f2565b50620001379291506200013b565b5090565b5b808211156200013757600081556001016200013c565b634e487b7160e01b600052604160045260246000fd5b80516001600160a01b03811681146200018057600080fd5b919050565b600080608083850312156200019957600080fd5b83601f840112620001a957600080fd5b604051606081016001600160401b0381118282101715620001ce57620001ce62000152565b604052806060850186811115620001e457600080fd5b855b818110156200020957620001fa8162000168565b835260209283019201620001e6565b50519196919550909350505050565b600181811c908216806200022d57607f821691505b6020821081036200024e57634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115620002a257600081815260208120601f850160051c810160208610156200027d5750805b601f850160051c820191505b818110156200029e5782815560010162000289565b5050505b505050565b81516001600160401b03811115620002c357620002c362000152565b620002db81620002d4845462000218565b8462000254565b602080601f831160018114620003135760008415620002fa5750858301515b600019600386901b1c1916600185901b1785556200029e565b600085815260208120601f198616915b82811015620003445788860151825594840194600190910190840162000323565b5085821015620003635787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b61157f80620003836000396000f3fe608060405234801561001057600080fd5b506004361061014d5760003560e01c806356878436116100c35780639dc29fac1161007c5780639dc29fac146102c9578063a457c2d7146102dc578063a9059cbb146102ef578063bb7b8b8014610302578063cc2b27d71461030a578063dd62ed3e1461031c57600080fd5b8063568784361461024557806370a082311461025857806386fc88d3146102815780638ea2da7d1461028957806395910b871461029657806395d89b41146102c157600080fd5b806323b872dd1161011557806323b872dd146101cd578063313ce567146101e057806339509351146101f957806340c10f191461020c5780634515cef31461021f57806347bf3cb11461023257600080fd5b806306fdde0314610152578063095ea7b31461017057806313143ecd1461019357806318160ddd146101a85780631a4d01d2146101ba575b600080fd5b61015a61032f565b60405161016791906111ea565b60405180910390f35b61018361017e366004611220565b6103c1565b6040519015158152602001610167565b6101a66101a136600461124a565b600955565b005b6002545b604051908152602001610167565b6101ac6101c8366004611275565b6103db565b6101836101db3660046112aa565b6105ad565b60055460ff165b60405160ff9091168152602001610167565b610183610207366004611220565b6105d1565b6101a661021a366004611220565b6105f3565b6101ac61022d3660046112d6565b610601565b6101ac610240366004611304565b610910565b6101a661025336600461124a565b600b55565b6101ac610266366004611330565b6001600160a01b031660009081526020819052604090205490565b600a546101ac565b6005546101e79060ff1681565b6102a96102a436600461124a565b610b0e565b6040516001600160a01b039091168152602001610167565b61015a610b2e565b6101a66102d7366004611220565b610b3d565b6101836102ea366004611220565b610b47565b6101836102fd366004611220565b610bc7565b6009546101ac565b6101ac61031836600461134b565b5090565b6101ac61032a366004611377565b610bd5565b60606003805461033e906113a1565b80601f016020809104026020016040519081016040528092919081815260200182805461036a906113a1565b80156103b75780601f1061038c576101008083540402835291602001916103b7565b820191906000526020600020905b81548152906001019060200180831161039a57829003601f168201915b5050505050905090565b6000336103cf818585610c00565b60019150505b92915050565b6040516323b872dd60e01b815260009030906323b872dd90610405903390849089906004016113db565b6020604051808303816000875af1158015610424573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061044891906113ff565b506000612710600b548661045c9190611437565b610466919061144e565b905060006104748287611470565b90506006856001600160801b03166003811061049257610492611483565b0160009054906101000a90046001600160a01b03166001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa1580156104e4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105089190611499565b60ff166006036105245761052164e8d4a510008261144e565b90505b6006856001600160801b03166003811061054057610540611483565b01546040516340c10f1960e01b8152336004820152602481018390526001600160a01b03909116906340c10f1990604401600060405180830381600087803b15801561058b57600080fd5b505af115801561059f573d6000803e3d6000fd5b509298975050505050505050565b6000336105bb858285610d25565b6105c6858585610d9f565b506001949350505050565b6000336103cf8185856105e48383610bd5565b6105ee91906114bc565b610c00565b6105fd8282610f31565b5050565b60008060005b60038160ff1610156108885761061f8160ff16610fde565b6106c2604051806040016040528060018152602001603160f91b81525060068360ff166003811061065257610652611483565b01546040516370a0823160e01b81523360048201526001600160a01b03909116906370a0823190602401602060405180830381865afa158015610699573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106bd91906114cf565b611026565b6106fe604051806040016040528060018152602001606960f81b815250868360ff16600381106106f4576106f4611483565b6020020135611026565b60068160ff166003811061071457610714611483565b01546001600160a01b03166323b872dd33308860ff86166003811061073b5761073b611483565b60200201356040518463ffffffff1660e01b815260040161075e939291906113db565b6020604051808303816000875af115801561077d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107a191906113ff565b506000858260ff16600381106107b9576107b9611483565b6020020135905060068260ff16600381106107d6576107d6611483565b0160009054906101000a90046001600160a01b03166001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015610828573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061084c9190611499565b60ff166006036108685761086564e8d4a5100082611437565b90505b61087281846114bc565b9250508080610880906114e8565b915050610607565b5061271081600b5461089a9190611437565b6108a4919061144e565b6108ae9082611470565b6040516340c10f1960e01b81523360048201526024810182905290915030906340c10f1990604401600060405180830381600087803b1580156108f057600080fd5b505af1158015610904573d6000803e3d6000fd5b50929695505050505050565b60006006846001600160801b03166003811061092e5761092e611483565b01546040516323b872dd60e01b81526001600160a01b03909116906323b872dd90610961903390309087906004016113db565b6020604051808303816000875af1158015610980573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109a491906113ff565b508160066001600160801b038616600381106109c2576109c2611483565b0160009054906101000a90046001600160a01b03166001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015610a14573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a389190611499565b60ff16600603610a5857610a5164e8d4a5100082611437565b9050610b06565b6006846001600160801b031660038110610a7457610a74611483565b0160009054906101000a90046001600160a01b03166001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015610ac6573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610aea9190611499565b60ff16600603610b0657610b0364e8d4a510008261144e565b90505b949350505050565b60068160038110610b1e57600080fd5b01546001600160a01b0316905081565b60606004805461033e906113a1565b6105fd828261106b565b60003381610b558286610bd5565b905083811015610bba5760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b60648201526084015b60405180910390fd5b6105c68286868403610c00565b6000336103cf818585610d9f565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b6001600160a01b038316610c625760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b6064820152608401610bb1565b6001600160a01b038216610cc35760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b6064820152608401610bb1565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591015b60405180910390a3505050565b6000610d318484610bd5565b90506000198114610d995781811015610d8c5760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e63650000006044820152606401610bb1565b610d998484848403610c00565b50505050565b6001600160a01b038316610e035760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b6064820152608401610bb1565b6001600160a01b038216610e655760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b6064820152608401610bb1565b6001600160a01b03831660009081526020819052604090205481811015610edd5760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b6064820152608401610bb1565b6001600160a01b038481166000818152602081815260408083208787039055938716808352918490208054870190559251858152909260008051602061152a833981519152910160405180910390a3610d99565b6001600160a01b038216610f875760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f2061646472657373006044820152606401610bb1565b8060026000828254610f9991906114bc565b90915550506001600160a01b0382166000818152602081815260408083208054860190555184815260008051602061152a833981519152910160405180910390a35050565b61102381604051602401610ff491815260200190565b60408051601f198184030181529190526020810180516001600160e01b031663f82c50f160e01b179052611183565b50565b6105fd828260405160240161103c929190611507565b60408051601f198184030181529190526020810180516001600160e01b0316632d839cb360e21b179052611183565b6001600160a01b0382166110cb5760405162461bcd60e51b815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f206164647265736044820152607360f81b6064820152608401610bb1565b6001600160a01b0382166000908152602081905260409020548181101561113f5760405162461bcd60e51b815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e604482015261636560f01b6064820152608401610bb1565b6001600160a01b03831660008181526020818152604080832086860390556002805487900390555185815291929160008051602061152a8339815191529101610d18565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b6000815180845260005b818110156111ca576020818501810151868301820152016111ae565b506000602082860101526020601f19601f83011685010191505092915050565b6020815260006111fd60208301846111a4565b9392505050565b80356001600160a01b038116811461121b57600080fd5b919050565b6000806040838503121561123357600080fd5b61123c83611204565b946020939093013593505050565b60006020828403121561125c57600080fd5b5035919050565b8035600f81900b811461121b57600080fd5b60008060006060848603121561128a57600080fd5b8335925061129a60208501611263565b9150604084013590509250925092565b6000806000606084860312156112bf57600080fd5b6112c884611204565b925061129a60208501611204565b600080608083850312156112e957600080fd5b60608301848111156112fa57600080fd5b9294923593505050565b60008060006060848603121561131957600080fd5b61132284611263565b925061129a60208501611263565b60006020828403121561134257600080fd5b6111fd82611204565b6000806040838503121561135e57600080fd5b8235915061136e60208401611263565b90509250929050565b6000806040838503121561138a57600080fd5b61139383611204565b915061136e60208401611204565b600181811c908216806113b557607f821691505b6020821081036113d557634e487b7160e01b600052602260045260246000fd5b50919050565b6001600160a01b039384168152919092166020820152604081019190915260600190565b60006020828403121561141157600080fd5b815180151581146111fd57600080fd5b634e487b7160e01b600052601160045260246000fd5b80820281158282048414176103d5576103d5611421565b60008261146b57634e487b7160e01b600052601260045260246000fd5b500490565b818103818111156103d5576103d5611421565b634e487b7160e01b600052603260045260246000fd5b6000602082840312156114ab57600080fd5b815160ff811681146111fd57600080fd5b808201808211156103d5576103d5611421565b6000602082840312156114e157600080fd5b5051919050565b600060ff821660ff81036114fe576114fe611421565b60010192915050565b60408152600061151a60408301856111a4565b9050826020830152939250505056feddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa26469706673582212206e15683fc2df137ee24425520cd27a6d7bd808fa640360c1bfcc8f7fddb0de7164736f6c63430008110033";

export class MockBasePool__factory extends ContractFactory {
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
    baseCoins_: [string, string, string],
    _forexPrice: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<MockBasePool> {
    return super.deploy(
      baseCoins_,
      _forexPrice,
      overrides || {}
    ) as Promise<MockBasePool>;
  }
  getDeployTransaction(
    baseCoins_: [string, string, string],
    _forexPrice: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(baseCoins_, _forexPrice, overrides || {});
  }
  attach(address: string): MockBasePool {
    return super.attach(address) as MockBasePool;
  }
  connect(signer: Signer): MockBasePool__factory {
    return super.connect(signer) as MockBasePool__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockBasePoolInterface {
    return new utils.Interface(_abi) as MockBasePoolInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MockBasePool {
    return new Contract(address, _abi, signerOrProvider) as MockBasePool;
  }
}
