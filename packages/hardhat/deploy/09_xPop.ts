import { parseEther } from "ethers/lib/utils";
import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { addContractToRegistry, getSetup } from "./utils";

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer } = await getSetup(hre);

  const deployed = await deploy("XPop", {
    from: await signer.getAddress(),
    args: [parseEther("10000000000")],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    contract: "XPop",
  });

  await addContractToRegistry("XPop", deployments, signer, hre);
};

export default main;
main.dependencies = ["setup"];
main.tags = ["frontend", "xpop", "grants"];
