import { constants, ethers } from "ethers";
import { useTypedWriteCall } from "@/lib/wagmi";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { adapterAtom, adapterDeploymentAtom } from "../adapter";
import { useAtom } from "jotai";
import { assetAtom } from "../assets";
import { feeAtom } from "../fees";


export const useDeployVault = () => {
  const { address: account } = useAccount();
  const [asset,] = useAtom(assetAtom);
  const [adapterData,] = useAtom(adapterDeploymentAtom);
  const [fees,] = useAtom(feeAtom);

  const { config, error: configError } = usePrepareContractWrite({
    address: "0xd855ce0c298537ad5b5b96060cf90e663696bbf6",
    abi,
    functionName: "deployVault",
    chainId: 1337,
    args: [
      {
        asset: asset.address,
        adapter: constants.AddressZero,
        fees: {
          deposit: fees.deposit,
          withdrawal: fees.withdrawal,
          management: fees.management,
          performance: fees.performance
        },
        feeRecipient: fees.recipient,
        depositLimit: constants.MaxUint256,
        owner: account
      },
      adapterData,
      {
        id: ethers.utils.formatBytes32String(""),
        data: "0x"
      },
      false,
      "0x",
      {
        vault: constants.AddressZero,
        staking: constants.AddressZero,
        creator: account,
        metadataCID: "cid",
        swapTokenAddresses: [
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero],
        swapAddress: constants.AddressZero,
        exchange: 0
      },
      0
    ],
  });

  // const { config, error: configError } = usePrepareContractWrite({
  //   address: "0xd855ce0c298537ad5b5b96060cf90e663696bbf6",
  //   abi,
  //   functionName: "deployAdapter",
  //   chainId: 1337,
  //   args: [
  //     asset.address,
  //     adapterData,
  //     {
  //       id: ethers.utils.formatBytes32String(""),
  //       data: "0x"
  //     },
  //     0
  //   ]
  // })

  return useContractWrite(config)
};


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