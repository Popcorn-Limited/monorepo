import { IpfsClient } from "@popcorn/utils";
import { BigNumber } from "ethers";
import { useVaultRegistry } from "@popcorn/components/hooks/vaults";
import { useEffect, useState } from "react";
import { Address, useContractRead } from "wagmi";

const Beefy = {
  name: "Beefy",
  description: "Beefy is a decentralized Yield Aggregator. Beefy offers vaults that allow anyone to deposit assets and earn yield on them. These vaults earn rewards and sell them for the asset of the vault. Thus compounding additional rewards and earning more assets. These Strategies are created by various independent developers and executed by the vault users. Governance decisions are handled by BIFI holders."
}

const Yearn = {
  name: "Yearn",
  description: "Yearn is a decentralized Yield Aggregator. Their main product offering is vaults that allow anyone to deposit assets and earn yield on them. Yearn deploys a variety of Strategies to earn yield. These Strategies are created and managed by various independent developers. Governance decisions are handled by YFI holders."
}

const BeefyStargateCompounder = {
  name: "Beefy Stargate Compounding",
  description: "The vault deposits the user's S*USDT in a Stargate farm, earning the platform's governance token. Earned token is swapped for more S*USDT. To complete the compounding cycle, the new S*USDT is added to the farm, ready to go for the next earning event. The transaction cost required to do all this is socialized among the vault's users.",
}


function getLocalMetadata(address: string): IpfsMetadata {
  switch (address) {
    case "0xDFd505B54E15D5B20842e868E4c19D7b6F0a4a5d":
      return {
        token: {
          name: "Tether LP",
          description: "USDT is a centralized stablecoin that aims to maintain the value of one USD. USDT is backed by an equal amount USD in cash reserves, commercial paper, fiduciary deposits, reserve repo notes, and short-term U.S. Treasury bonds in various financial institutions. Each USDT can be redeemed for one USD. Hong Kong-based Tether creates and manages USDT. This USDT LP is a Stargate LP token that is used to facilitate cross-chain bridging. Each USDT LP is backed by USDT in Stargate pool on various chains.",
        },
        protocol: Beefy,
        strategy: BeefyStargateCompounder,
        getTokenUrl: "https://stargate.finance/pool/usdt-matic/add",
      }
    case "0xB38b9522005ffBb0e297c17A8e2a3f11C6433e8C":
      return {
        token: {
          name: "Usdc LP",
          description: "USDC is a centralized stablecoin that aims to maintain the value of one USD. USDC is backed by an equal amount USD in cash reserves and short-term U.S. Treasury bonds in various financial institutions. Each USDC can be redeemed for one USD. Centre consortium creates and manages USDC. This USDC LP is a Stargate LP token that is used to facilitate cross-chain bridging. Each USDC LP is backed by USDC in Stargate pool on various chains.",
        },
        protocol: Beefy,
        strategy: BeefyStargateCompounder,
        getTokenUrl: "https://stargate.finance/pool/usdc-matic/add",
      }
    case "0x5d344226578DC100b2001DA251A4b154df58194f":
      return {
        token: {
          name: "DAI",
          description: "DAI is a decentralized stablecoin that aims to maintain the value of one USD. DAI is backed by a mix of multiple cryptocurrencies. Users of the Maker Protocol and MakerDAO can create new DAI by providing collateral to back the value of the newly minted DAI. Liquidations should ensure that the value of minted DAI doesn't fall below its backing. MakerDAO controls which assets can be used to mint DAI and other risk parameters."
        },
        protocol: Yearn,
        strategy: {
          name: "Yearn Compound Folding",
          description: "The DAI Sweet Vault supplies and borrows DAI on Compound Finance simultaneously to earn COMP. Flashmints are then used to mint DAI from MakerDAO to flashlend and fold the position to boost APY. Earned tokens are then harvested, sold for more DAI, and then deposited back into the strategy."
        }
      }
    case "0xc1D4a319dD7C44e332Bd54c724433C6067FeDd0D":
      return {
        token: {
          name: "USDC",
          description: "USDC is a centralized stablecoin that aims to maintain the value of one USD. USDC is backed by an equal amount USD in cash reserves and short-term U.S. Treasury bonds in various financial institutions. Each USDC can be redeemed for one USD. Centre consortium creates and manages USDC."
        },
        protocol: Yearn,
        strategy: {
          name: "Yearn Compound Folding",
          description: "Supplies and borrows USDC on Compound Finance simultaneously to earn COMP. Flashmints are then used to mint DAI from MakerDAO to flashlend and fold the position to boost APY. Earned tokens are then harvested, sold for more USDC, and then deposited back into the strategy."
        }
      }
  }
}

function useGetIpfsMetadata(address: string, cid?: string): IpfsMetadata {
  const [ipfsData, setIpfsData] = useState<IpfsMetadata>();

  useEffect(() => {
    if (address) {
      if (cid) {
        IpfsClient.get<IpfsMetadata>(cid).then(res => setIpfsData(res))
      } else {
        setIpfsData(getLocalMetadata(address))
      }
    }
  },
    [address, cid]
  )

  return ipfsData;
}

export default function useVaultMetadata(vaultAddress, chainId): VaultMetadata {
  const registry = useVaultRegistry(chainId);
  const { data } = useContractRead({
    address: registry.address as Address,
    args: [vaultAddress],
    chainId,
    functionName: "getVault",
    enabled: !!vaultAddress,
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
  const ipfsMetadata = useGetIpfsMetadata(vaultAddress, data?.metadataCID);

  return { ...data, metadata: ipfsMetadata } as VaultMetadata;
}


export type VaultMetadata = {
  /** @notice Vault address*/
  vault: Address;
  /** @notice Staking contract for the vault*/
  staking: Address;
  /** @notice Owner and Vault creator*/
  creator: Address;
  /** @notice IPFS CID of vault metadata*/
  metadataCID: string;
  /** @notice Metadata pulled from IPFS*/
  metadata?: IpfsMetadata;
  /** @notice OPTIONAL - If the asset is an Lp Token these are its underlying assets*/
  swapTokenAddresses: [Address, Address, Address, Address, Address, Address, Address, Address];
  /** @notice OPTIONAL - If the asset is an Lp Token its the pool address*/
  swapAddress: Address;
  /** @notice OPTIONAL - If the asset is an Lp Token this is the identifier of the exchange (1 = curve)*/
  exchange: BigNumber;
};

export type IpfsMetadata = {
  token: {
    name: string;
    description: string;
  };
  protocol: {
    name: string;
    description: string;
  }
  strategy: {
    name: string;
    description: string;
  }
  getTokenUrl?: string;
}
