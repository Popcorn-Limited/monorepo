import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { addContractToRegistry, getSetup } from "./utils";

const contract_name = "ContractRegistry";
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer } = await getSetup(hre);

  const deployed = await deploy(contract_name, {
    from: await signer.getAddress(),
    args: [(await deployments.get("ACLRegistry")).address],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });
  await addContractToRegistry(contract_name, deployments, signer, hre);
};

export default func;
func.dependencies = ["setup", "acl-registry"];
func.tags = ["core", "frontend", "contract-registry", "grants"];
