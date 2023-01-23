import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { addContractToRegistry, getSetup } from "./utils";

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer } = await getSetup(hre);

  const deployed = await deploy("TestPOP", {
    from: await signer.getAddress(),
    args: ["Popcorn", "POP", 18],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    contract: "MockERC20",
  });

  await addContractToRegistry("TestPOP", deployments, signer, hre);
};

module.exports = main;
export default main;
main.dependencies = ["setup", "contract-registry", "acl-registry"];
main.tags = ["LBP", "frontend", "test-pop"];
