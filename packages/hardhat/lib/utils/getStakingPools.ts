// ------------------------ TODO - Should be moved to script helpers --------------------
export type Pool = {
  poolName: string;
  contract: string;
  inputToken: string;
  rewardsToken?: string;
  vaultName?: string;
};

export async function getVaultStakingPools(chainId: number, addresses, deployments): Promise<Pool[]> {
  const { crvSEth } = addresses;
  switch (chainId) {
    case 1:
      return [];
    case 1337:
      return [
        {
          poolName: "sEthSweetVaultStaking",
          contract: "Staking",
          vaultName: "sEthSweetVault",
          inputToken: crvSEth,
          rewardsToken: (await deployments.get("TestPOP")).address,
        },
      ];
    case 31337:
      return [
        {
          poolName: "sEthSweetVaultStaking",
          contract: "Staking",
          vaultName: "sEthSweetVault",
          inputToken: crvSEth,
          rewardsToken: (await deployments.get("TestPOP")).address,
        },
      ];
    case 137:
      return [];
    default:
      return [];
  }
}

export async function getStakingPools(chainId: number, addresses, deployments): Promise<Pool[]> {
  const { pop, butter, threeX, popUsdcArrakisVault } = addresses;
  switch (chainId) {
    case 1:
      return [
        {
          poolName: "PopLocker",
          contract: "PopLocker",
          inputToken: pop,
        },
        {
          poolName: "popUsdcLPStaking",
          contract: "Staking",
          inputToken: popUsdcArrakisVault,
          rewardsToken: pop,
        },
        {
          poolName: "threeXStaking",
          contract: "Staking",
          inputToken: threeX,
          rewardsToken: pop,
        },
        {
          poolName: "butterStaking",
          contract: "Staking",
          inputToken: butter,
          rewardsToken: pop,
        },
      ];
    case 1337:
      return [
        {
          poolName: "PopLocker",
          contract: "PopLocker",
          inputToken: (await deployments.get("TestPOP")).address,
        },
        {
          poolName: "butterStaking",
          contract: "Staking",
          inputToken: butter,
          rewardsToken: (await deployments.get("TestPOP")).address,
        },
        {
          poolName: "threeXStaking",
          contract: "Staking",
          inputToken: threeX,
          rewardsToken: (await deployments.get("TestPOP")).address,
        },
      ];
    case 31337:
      return [
        {
          poolName: "PopLocker",
          contract: "PopLocker",
          inputToken: (await deployments.get("TestPOP")).address,
        },
        {
          poolName: "butterStaking",
          contract: "Staking",
          inputToken: butter,
          rewardsToken: (await deployments.get("TestPOP")).address,
        },
        {
          poolName: "threeXStaking",
          contract: "Staking",
          inputToken: threeX,
          rewardsToken: (await deployments.get("TestPOP")).address,
        },
      ];
    case 137:
      return [
        {
          poolName: "popUsdcArrakisVaultStaking",
          contract: "Staking",
          inputToken: addresses.popUsdcArrakisVault,
          rewardsToken: pop,
        },
        // {
        //   poolName: "PopLocker",
        //   contract: "PopLocker",
        //   inputToken: pop,
        // },
        // {
        //   poolName: "popUsdcLPStaking",
        //   contract: "Staking",
        //   inputToken: popUsdcLp,
        //   rewardsToken: pop,
        // },
      ];
    default:
      return [
        {
          poolName: "PopLocker",
          contract: "PopLocker",
          inputToken: (await deployments.get("TestPOP")).address,
        },
      ];
  }
}
