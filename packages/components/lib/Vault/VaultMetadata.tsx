import useVaultMetadata, { VaultMetadata } from "./hooks/useVaultMetadata";

// TODO use proper ipfs fetch

type VaultMetadataProps = {
  chainId: any;
  vaultAddress: any;
  children: (metadata?: Partial<VaultMetadata>) => React.ReactElement;
};

function VaultMetadata({ chainId, children, vaultAddress }: VaultMetadataProps) {
  const vaultMetadata = useVaultMetadata(vaultAddress, chainId);


  return children(vaultMetadata as VaultMetadata);
}

export default VaultMetadata;
