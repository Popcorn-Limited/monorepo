import type { BigNumber } from "ethers";
import { useVaultRegistry } from "@popcorn/components/hooks/vaults";
import { Address, useContractRead } from "wagmi";


function useGetIpfsMetadata(cid?: string): any {
  return { displayText: { token: "Token Description", description: "Strategy Description" }, curveLink: "https://curve.fi/" }
}

type VaultMetadataProps = {
  chainId: any;
  vaultAddress: any;
  children: (metadata?: Partial<VaultMetadata>) => React.ReactElement;
};

function VaultMetadata({ chainId, children, vaultAddress }: VaultMetadataProps) {
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
  const ipfsMetadata = useGetIpfsMetadata(data?.metadataCID);


  return children({ ...data, metadata: ipfsMetadata } as VaultMetadata);
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
  metadata: IpfsMetadata;
  /** @notice OPTIONAL - If the asset is an Lp Token these are its underlying assets*/
  swapTokenAddresses: [Address, Address, Address, Address, Address, Address, Address, Address];
  /** @notice OPTIONAL - If the asset is an Lp Token its the pool address*/
  swapAddress: Address;
  /** @notice OPTIONAL - If the asset is an Lp Token this is the identifier of the exchange (1 = curve)*/
  exchange: BigNumber;
};

export type IpfsMetadata = {
  displayText: {
    token: string;
    description: string;
  };
  curveLink: string;
}

export default VaultMetadata;
