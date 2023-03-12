
import { useTypedReadCall } from "@popcorn/components/hooks/wagmi";
import { BigNumber, constants, ethers } from "ethers";
import { Address, useAccount, useContractRead, useContractReads, useContractWrite, usePrepareContractWrite } from "wagmi";


export default function TestPage() {
  const { address: account } = useAccount();

  const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
  const crvStEthEth = "0x06325440D014e39736583c165C2963BA99fAf14E"

  const { data:vaultData } = useContractRead({
    chainId:1337,
    address: "0xd977422c9ee9b646f64a4c4389a6c98ad356d8c4" as Address,
    args: ["0x00876711A9Ae5d143A860118f3DDB675479A5477"],
    functionName: "getVault",
    abi: [{
      "inputs": [
        {
          "internalType": "address",
          "name": "vault",
          "type": "address"
        }
      ],
      "name": "getVault",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "vault",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "staking",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "creator",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "metadataCID",
              "type": "string"
            },
            {
              "internalType": "address[8]",
              "name": "swapTokenAddresses",
              "type": "address[8]"
            },
            {
              "internalType": "address",
              "name": "swapAddress",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "exchange",
              "type": "uint256"
            }
          ],
          "internalType": "struct VaultMetadata",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }],
  });

  console.log({vaultData})

  const yearnAdapterConfig = {
    id: ethers.utils.formatBytes32String("YearnAdapter"),
    data: "0x"
  };
  const beefyAdapterConfig = {
    id: ethers.utils.formatBytes32String("BeefyAdapter"),
    data: ethers.utils.defaultAbiCoder.encode(["address", "address"], ["0xa7739fd3d12ac7F16D8329AF3Ee407e19De10D8D", "0xAe3F0C61F3Dc48767ccCeF3aD50b29437BE4b1a4"])
  }

  const { config, error: configError } = usePrepareContractWrite({
    address: '0xd855ce0c298537ad5b5b96060cf90e663696bbf6',
    abi,
    functionName: 'deployVault',
    args: [
      {
        asset: crvStEthEth,
        adapter: constants.AddressZero,
        fees: { deposit: BigNumber.from(0), withdrawal: BigNumber.from(0), management: BigNumber.from(0), performance: BigNumber.from(0) },
        feeRecipient: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        depositLimit: constants.MaxUint256,
        owner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      },
      beefyAdapterConfig,
      {
        id: ethers.utils.formatBytes32String(""),
        data: "0x"
      },
      false,
      "0x",
      {
        vault: constants.AddressZero,
        staking: constants.AddressZero,
        creator: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        metadataCID: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
        swapTokenAddresses: [
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero],
        swapAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        exchange: 1
      },
      0
    ],
    chainId: 1337,
    overrides: { gasLimit: BigNumber.from(1487897) }
  })

  // const { config } = usePrepareContractWrite({
  //   address: '0x4653251486a57f90ee89f9f34e098b9218659b83',
  //   abi,
  //   functionName: 'deployAdapter',
  //   args: [
  //     crvStEthEth,
  //     beefyAdapterConfig,
  //     { id: ethers.utils.formatBytes32String(""), data: ethers.utils.formatBytes32String("") },
  //     0
  //   ],
  //   chainId: 1337
  // })

  const { data, error, isLoading, isSuccess, write } = useContractWrite(config)

  const vault = {
    address: "0x03420ce6a9c00b7d44886471cbfce67331ce40ac" as Address,
    abi: ["function adapter() view returns (address)"]
  }

  const beefyAdapter = {
    address: "0x4DdA6BCf63EBea2851C23DaE45DD01fEB59a5493" as Address,
    abi: ["function asset() view returns (address)", "function beefyVault() view returns (address)", "function beefyBooster() view returns (address)"]
  }

  const { data: adapter } = useContractRead({ ...vault, functionName: "adapter" })
  const { data: readData } = useContractReads({ contracts: [{ ...beefyAdapter, functionName: "asset" }, { ...beefyAdapter, functionName: "beefyVault" }, { ...beefyAdapter, functionName: "beefyBooster" }] })

  return <div><button onClick={() => write?.()}>Button</button></div>
}

const beefyAdapterabi = [{
  inputs: [],
  name: "asset",
  outputs: [
    {
      internalType: "address",
      name: "",
      type: "address"
    }
  ],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [],
  name: "beefyBooster",
  outputs: [
    {
      internalType: "contract IBeefyBooster",
      name: "",
      type: "address"
    }
  ],
  stateMutability: "view",
  type: "function"
},
{
  inputs: [],
  name: "beefyVault",
  outputs: [
    {
      internalType: "contract IBeefyVault",
      name: "",
      type: "address"
    }
  ],
  stateMutability: "view",
  type: "function"
}]

const abi = [{
  inputs: [
    {
      components: [
        {
          internalType: "contract IERC20Upgradeable",
          name: "asset",
          type: "address"
        },
        {
          internalType: "contract IERC4626Upgradeable",
          name: "adapter",
          type: "address"
        },
        {
          components: [
            {
              internalType: "uint64",
              name: "deposit",
              type: "uint64"
            },
            {
              internalType: "uint64",
              name: "withdrawal",
              type: "uint64"
            },
            {
              internalType: "uint64",
              name: "management",
              type: "uint64"
            },
            {
              internalType: "uint64",
              name: "performance",
              type: "uint64"
            }
          ],
          internalType: "struct VaultFees",
          name: "fees",
          type: "tuple"
        },
        {
          internalType: "address",
          name: "feeRecipient",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "depositLimit",
          type: "uint256"
        },
        {
          internalType: "address",
          name: "owner",
          type: "address"
        }
      ],
      internalType: "struct VaultInitParams",
      name: "vaultData",
      type: "tuple"
    },
    {
      components: [
        {
          internalType: "bytes32",
          name: "id",
          type: "bytes32"
        },
        {
          internalType: "bytes",
          name: "data",
          type: "bytes"
        }
      ],
      internalType: "struct DeploymentArgs",
      name: "adapterData",
      type: "tuple"
    },
    {
      components: [
        {
          internalType: "bytes32",
          name: "id",
          type: "bytes32"
        },
        {
          internalType: "bytes",
          name: "data",
          type: "bytes"
        }
      ],
      internalType: "struct DeploymentArgs",
      name: "strategyData",
      type: "tuple"
    },
    {
      internalType: "bool",
      name: "deployStaking",
      type: "bool"
    },
    {
      internalType: "bytes",
      name: "rewardsData",
      type: "bytes"
    },
    {
      components: [
        {
          internalType: "address",
          name: "vault",
          type: "address"
        },
        {
          internalType: "address",
          name: "staking",
          type: "address"
        },
        {
          internalType: "address",
          name: "creator",
          type: "address"
        },
        {
          internalType: "string",
          name: "metadataCID",
          type: "string"
        },
        {
          internalType: "address[8]",
          name: "swapTokenAddresses",
          type: "address[8]"
        },
        {
          internalType: "address",
          name: "swapAddress",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "exchange",
          type: "uint256"
        }
      ],
      internalType: "struct VaultMetadata",
      name: "metadata",
      type: "tuple"
    },
    {
      internalType: "uint256",
      name: "initialDeposit",
      type: "uint256"
    }
  ],
  name: "deployVault",
  outputs: [
    {
      internalType: "address",
      name: "vault",
      type: "address"
    }
  ],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [],
  name: "VAULT",
  outputs: [
    {
      internalType: "bytes32",
      name: "",
      type: "bytes32"
    }
  ],
  stateMutability: "view",
  type: "function"
},
{
  inputs: [],
  name: "vaultRegistry",
  outputs: [
    {
      internalType: "contract IVaultRegistry",
      name: "",
      type: "address"
    }
  ],
  stateMutability: "view",
  type: "function"
},
{
  inputs: [],
  name: "acceptAdminProxyOwnership",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
},
{
  inputs: [
    {
      internalType: "contract IERC20Upgradeable",
      name: "asset",
      type: "address"
    }
  ],
  name: "deployStaking",
  outputs: [
    {
      internalType: "address",
      name: "",
      type: "address"
    }
  ],
  stateMutability: "nonpayable",
  type: "function"
},
{
  inputs: [
    {
      internalType: "contract IERC20Upgradeable",
      name: "asset",
      type: "address"
    },
    {
      components: [
        {
          internalType: "bytes32",
          name: "id",
          type: "bytes32"
        },
        {
          internalType: "bytes",
          name: "data",
          type: "bytes"
        }
      ],
      internalType: "struct DeploymentArgs",
      name: "adapterData",
      type: "tuple"
    },
    {
      components: [
        {
          internalType: "bytes32",
          name: "id",
          type: "bytes32"
        },
        {
          internalType: "bytes",
          name: "data",
          type: "bytes"
        }
      ],
      internalType: "struct DeploymentArgs",
      name: "strategyData",
      type: "tuple"
    },
    {
      internalType: "uint256",
      name: "initialDeposit",
      type: "uint256"
    }
  ],
  name: "deployAdapter",
  outputs: [
    {
      internalType: "address",
      name: "adapter",
      type: "address"
    }
  ],
  stateMutability: "nonpayable",
  type: "function"
}]