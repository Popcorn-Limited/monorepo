import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DAO_ROLE, KEEPER_ROLE, INCENTIVE_MANAGER_ROLE, VAULTS_CONTROLLER } from "../lib/acl/roles";
import { getSetup, TablePrinter, addContractToRegistry } from "./utils";

const contract_name = "ACLRegistry";

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer } = await getSetup(hre);

  const deployed = await deploy(contract_name, {
    from: await signer.getAddress(),
    args: [],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    gasLimit: 2000000,
  });

  await addContractToRegistry(contract_name, deployments, signer, hre, deployed.address);

  const aclRegistry = await hre.ethers.getContractAt(
    "ACLRegistry",
    (
      await deployments.get("ACLRegistry")
    ).address,
    signer
  );

  //Grant signer roles for later contract interactions
  await aclRegistry.grantRole(DAO_ROLE, await signer.getAddress());
  await aclRegistry.grantRole(KEEPER_ROLE, await signer.getAddress());
  await aclRegistry.grantRole(INCENTIVE_MANAGER_ROLE, await signer.getAddress());
  await aclRegistry.grantRole(VAULTS_CONTROLLER, await signer.getAddress());
};

export default main;
main.dependencies = ["setup"];
main.tags = ["core", "frontend", "acl-registry"];
