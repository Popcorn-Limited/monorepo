import type { BigNumber } from "ethers";
import { useTypedReadCall } from "@popcorn/components/hooks/wagmi";
import { useVaultRegistry } from "@popcorn/components/hooks/vaults";

type VaultMetadataProps = {
  chainId: any;
  vaultAddress: any;
  children: (metadata?: Partial<VaultMetadata>) => React.ReactElement;
};

function VaultMetadata({ chainId, children, vaultAddress }: VaultMetadataProps) {
  const registry = useVaultRegistry(chainId);
  const { data = [] } = useTypedReadCall<any[]>({
    chainId,
    address: registry?.address,
    args: [vaultAddress],
    functionName: "getVault",
    abi: [`function getVault(address) external view returns(${StructVaultMetadata})`],
  });

  const [vault, staking, creator, metadataCID, swapTokenAddresses, swapAddress, exchange] = data;

  return children({
    vault,
    staking,
    creator,
    metadataCID,
    swapTokenAddresses,
    swapAddress,
    exchange,
  } as VaultMetadata);
}

export const StructVaultMetadata = "(address, address, address, string, address[8], address, uint256)";

export type VaultMetadata = {
  /** @notice Vault address*/
  vault: string;
  /** @notice Staking contract for the vault*/
  staking: string;
  /** @notice Owner and Vault creator*/
  creator: string;
  /** @notice IPFS CID of vault metadata*/
  metadataCID: string;
  /** @notice OPTIONAL - If the asset is an Lp Token these are its underlying assets*/
  swapTokenAddresses: string[8];
  /** @notice OPTIONAL - If the asset is an Lp Token its the pool address*/
  swapAddress: string;
  /** @notice OPTIONAL - If the asset is an Lp Token this is the identifier of the exchange (1 = curve)*/
  exchange: BigNumber;
};

export default VaultMetadata;
