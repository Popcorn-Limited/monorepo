import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { parseEther } from "ethers/lib/utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { addContractToRegistry, getSetup } from "./utils";

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer } = await getSetup(hre);
  const pop = ["mainnet", "bsc", "arbitrum", "polgon"].includes(hre.network.name)
    ? addresses.pop
    : (await deployments.get("TestPOP")).address;

  const deployed = await deploy("RewardsDistribution", {
    from: await signer.getAddress(),
    args: [(await signer.getAddress()) as string, (await deployments.get("ContractRegistry")).address, pop],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    contract: "RewardsDistribution",
  });
  await addContractToRegistry("RewardsDistribution", deployments, signer, hre);

  const rewardsDistribution = await hre.ethers.getContractAt(
    "RewardsDistribution",
    (
      await deployments.get("RewardsDistribution")
    ).address,
    signer
  );
  rewardsDistribution.setKeeperIncentiveBps(parseEther("0.001"));

  const keeperIncentive = await hre.ethers.getContractAt(
    "KeeperIncentiveV2",
    (
      await deployments.get("KeeperIncentive")
    ).address,
    signer
  );
  await keeperIncentive.createIncentive(
    await (
      await deployments.get("RewardsDistribution")
    ).address,
    0,
    true,
    true,
    await (
      await deployments.get("TestPOP")
    ).address,
    1,
    0
  );
};
export default main;
main.dependencies = ["setup", "contract-registry", "test-pop"];
main.tags = ["core", "rewards-distribution"];
