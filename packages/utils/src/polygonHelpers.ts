export const isChainIdPolygonOrLocal = (chainId: number) => {
  const supportedChains = [137, 31337, 1337, 5];
  return supportedChains.includes(chainId);
};
