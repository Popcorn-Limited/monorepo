import deployments from "@popcorn/hardhat/lib/utils/exporter/out/deployments.json";

export type Deployments = typeof deployments;

export type DeploymentContractsKeys<ChainId extends keyof Deployments> = keyof Deployments[ChainId]["contracts"];

export type DeploymentChainIds = keyof Deployments;

export type GetNamedAccountsResponse = {
  address: string;
  abi?: any;
  chainId: number;
  metadata?: any;
  __alias: string;
  [key: string]: any;
}[];
/**
 * getNamedAccounts is a utility function that returns an array of contracts with metadata defined in namedAccounts.json
 * @param chainId chainId as string
 * @param contractAddresses string[] - optional - if not provided, all contracts for the given chainId will be returned. otherwise an array of contract aliases or contract addresses may be provided to get the contract metadata for those contracts
 * @returns
 */
export const getNamedAccounts = <Chain extends DeploymentChainIds>(
  chainId: Chain,
  contractAddresses?: Array<DeploymentContractsKeys<Chain>> | undefined[],
): GetNamedAccountsResponse => {
  if (Number(chainId) === 0) {
    return Object.keys(deployments).flatMap((chainId) =>
      Object.keys(deployments[chainId].contracts).map((contract) => map(chainId, contract)),
    );
  }
  return !contractAddresses
    ? Object.keys(deployments[chainId].contracts).map((contract) => map(chainId, contract))
    : contractAddresses.map((contract) => map(chainId, contract));
};

const map = (chainId, contractAddress) => {
  const _contract =
    deployments[chainId].contracts[(contractAddress as string)?.toLowerCase()] ||
    deployments[chainId].contracts[contractAddress as string];
  return {
    ..._contract,
    ...(_contract?.metadata || {}),
    __alias: contractAddress,
    chainId: chainId,
  };
};
