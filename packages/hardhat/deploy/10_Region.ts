import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { addContractToRegistry, getSetup } from "./utils";

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer } = await getSetup(hre);

  await deploy("Region", {
    from: await signer.getAddress(),
    args: [(await deployments.get("BeneficiaryVaults")).address, (await deployments.get("ContractRegistry")).address],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    contract: "Region",
  });
  await addContractToRegistry("Region", deployments, signer, hre);
};
export default main;
main.dependencies = ["setup", "contract-registry", "beneficiary-vaults"];
main.tags = ["core", "region"];
