import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { addContractToRegistry, getSetup } from "./utils";

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer } = await getSetup(hre);

  await deploy("GrantElections", {
    from: await signer.getAddress(),
    args: [(await deployments.get("ContractRegistry")).address],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    contract: "GrantElections",
  });

  const aclRegistry = await hre.ethers.getContractAt("ACLRegistry", (await deployments.get("ACLRegistry")).address);
  const participationReward = await hre.ethers.getContractAt(
    "ParticipationReward",
    (
      await deployments.get("ParticipationReward")
    ).address
  );

  await addContractToRegistry("GrantElections", deployments, signer, hre);
  let tx = await aclRegistry.grantRole(
    ethers.utils.id("BeneficiaryGovernance"),
    (
      await deployments.get("GrantElections")
    ).address
  );
  await tx.wait();

  tx = await participationReward.addControllerContract(
    ethers.utils.id("GrantElections"),
    (
      await deployments.get("GrantElections")
    ).address
  );
  await tx.wait();
};
export default main;
main.dependencies = ["setup", "acl-registry", "contract-registry", "participation-reward"];
main.tags = ["core", "grant-elections", "grants"];
