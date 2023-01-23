import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getStakingPools } from "../lib/utils/getStakingPools";
import { addContractToRegistry, getSetup, wait } from "./utils";

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer, log } = await getSetup(hre);

  const pop = ["mainnet", "polygon", "arbitrum", "bsc"].includes(hre.network.name)
    ? addresses.pop
    : (await deployments.get("TestPOP")).address;

  const stakingPools = await getStakingPools(hre.network.config.chainId, addresses, deployments);

  for (var i = 0; i < stakingPools.length; i++) {
    const { poolName, rewardsToken, inputToken, contract } = stakingPools[i];
    console.log("Deploying staking contract", poolName, rewardsToken, inputToken, contract);
    const deployed = await deploy(poolName, {
      from: await signer.getAddress(),
      args:
        contract === "PopLocker"
          ? [inputToken, (await deployments.get("RewardsEscrow")).address]
          : [rewardsToken, inputToken, (await deployments.get("RewardsEscrow")).address],
      log: true,
      autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks,
      contract: contract,
    });

    await prepareRewardsEscrow((await deployments.get(poolName)).address, signer, hre, log);

    await addContractToRegistry(poolName, deployments, signer, hre);
    if (contract === "PopLocker") {
      const popLocker = await hre.ethers.getContractAt("PopLocker", deployed.address);

      log("setting approvals ...");
      const approvalTx = await popLocker.connect(signer).setApprovals();
      await wait(approvalTx, hre);

      const isConfigured: boolean = await (async () => {
        let configured = false;
        try {
          configured = (await popLocker.rewardTokens(0)).length ? true : false;
        } catch (e) {
          configured = false;
        }
        return configured;
      })();

      if (!isConfigured) {
        const dist = (await hre.deployments.get("RewardsDistribution")).address;
        log(`adding pop (${pop}) as rewards tokens with reward distributor (${dist})...`);
        const addRewardTx = await popLocker.connect(signer).addReward(pop, dist, true);
        await wait(addRewardTx, hre);
      }
    } else {
      log("approving RewardsDistribution contract as rewards distributor ...");
      const addApprovalTx = await (
        await hre.ethers.getContractAt("Staking", deployed.address)
      ).approveRewardDistributor((await hre.deployments.get("RewardsDistribution")).address, true);
      await wait(addApprovalTx, hre);
    }
  }
};
export default main;
main.dependencies = ["setup", "contract-registry", "rewards-escrow", "rewards-distribution"];
main.tags = ["frontend", "staking"];

async function prepareRewardsEscrow(stakingAddress: string, signer: any, hre: HardhatRuntimeEnvironment, log) {
  log("preparing rewards escrow ...");
  const { deployments } = hre;
  const rewardsEscrow = await hre.ethers.getContractAt(
    "RewardsEscrow",
    await (
      await deployments.get("RewardsEscrow")
    ).address,
    signer
  );
  const tx = await rewardsEscrow.addAuthorizedContract(stakingAddress);
  await wait(tx, hre);
}
