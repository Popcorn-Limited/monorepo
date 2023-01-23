import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import process from "child_process";

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  console.log("running export script");
  process.exec("sleep 5; yarn export");
};
export default main;
main.tags = ["export"];
