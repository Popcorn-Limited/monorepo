import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { addContractToRegistry, getSetup } from "./utils";

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer } = await getSetup(hre);
  const pop = addresses.pop;

  await deploy("RewardsManager", {
    from: await signer.getAddress(),
    args: [(await deployments.get("ContractRegistry")).address, addresses.uniswapRouter],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    contract: "RewardsManager",
  });

  //Adding permissions and other maintance
  const keeperIncentive = await hre.ethers.getContractAt(
    "KeeperIncentiveV2",
    (
      await deployments.get("KeeperIncentive")
    ).address,
    signer
  );

  const aclRegistry = await hre.ethers.getContractAt(
    "ACLRegistry",
    (
      await deployments.get("ACLRegistry")
    ).address,
    signer
  );

  await addContractToRegistry("RewardsManager", deployments, signer, hre);
  await aclRegistry.grantRole(ethers.utils.id("RewardsManager"), (await deployments.get("RewardsManager")).address);

  console.log("creating incentive 1 ...");
  await keeperIncentive.createIncentive(
    (
      await deployments.get("RewardsManager")
    ).address,
    0,
    true,
    true,
    pop,
    60 * 60 * 24,
    0
  );

  console.log("creating incentive 2 ...");
  await keeperIncentive.createIncentive(
    (
      await deployments.get("RewardsManager")
    ).address,
    0,
    true,
    true,
    pop,
    60 * 60 * 24,
    0
  );
};
export default main;
main.dependencies = ["setup", "acl-registry", "contract-registry", "keeper-incentives"];
main.tags = ["core", "rewards-manager", "grants"];
