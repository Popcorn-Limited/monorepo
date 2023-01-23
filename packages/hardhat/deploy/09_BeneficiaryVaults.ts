import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { addContractToRegistry, getSetup } from "./utils";

const contract_name = "BeneficiaryVaults";
const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer } = await getSetup(hre);

  const deployed = await deploy(contract_name, {
    from: await signer.getAddress(),
    args: [(await deployments.get("ContractRegistry")).address],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    contract: "BeneficiaryVaults",
  });
  await addContractToRegistry("BeneficiaryVaults", deployments, signer, hre);
};
export default main;
main.dependencies = ["setup", "contract-registry"];
main.tags = ["core", "beneficiary-vaults"];
