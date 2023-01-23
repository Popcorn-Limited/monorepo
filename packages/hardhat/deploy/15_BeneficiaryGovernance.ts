import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { addContractToRegistry, getSetup } from "./utils";

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer } = await getSetup(hre);

  const aclRegistry = await hre.ethers.getContractAt(
    "ACLRegistry",
    (
      await deployments.get("ACLRegistry")
    ).address,
    signer
  );
  const participationReward = await hre.ethers.getContractAt(
    "ParticipationReward",
    (
      await deployments.get("ParticipationReward")
    ).address,
    signer
  );

  await deploy("BeneficiaryGovernance", {
    from: await signer.getAddress(),
    args: [(await deployments.get("ContractRegistry")).address],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    contract: "BeneficiaryGovernance",
  });

  await addContractToRegistry("BeneficiaryGovernance", deployments, signer, hre);

  await aclRegistry.grantRole(
    ethers.utils.id("BeneficiaryGovernance"),
    (
      await deployments.get("BeneficiaryGovernance")
    ).address
  );
  await participationReward.addControllerContract(
    ethers.utils.id("BeneficiaryGovernance"),
    (
      await deployments.get("BeneficiaryGovernance")
    ).address
  );
};
export default main;
main.dependencies = ["setup", "contract-registry", "acl-registry", "participation-reward"];
main.tags = ["core", "beneficiary-governance"];
