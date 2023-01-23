/** variables: { assetAddress: String! } */
export default `
query VaultByAsset($assetAddress: String!) {
  vaults(
    first: 1
    orderBy: balanceTokens
    orderDirection: desc
    where: {
      token_contains: $assetAddress
      classification_not: Experimental
    }
  ) {
    id
  }
}

` as const;
