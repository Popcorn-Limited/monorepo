/** variables: { assetAddress: String! } */
export default `
query VaultByAsset($assetAddress: String!) {
  vaults(
    first: 1
    orderBy: balanceTokens
    orderDirection: desc
    where: {token_: {id: $assetAddress}}
  ) 
  {
    id
  }
}
` as const;
