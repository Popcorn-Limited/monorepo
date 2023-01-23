import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const addresses = await getNamedAccounts();
  if (["hardhat", "local"].includes(hre.network.name)) {
    //Faucet
    await deploy("Faucet", {
      from: addresses.deployer,
      args: [addresses.uniswapRouter /* addresses.curveAddressProvider, addresses.curveFactoryMetapoolDepositZap */],
      log: true,
      autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
      contract: "Faucet",
    });
    await hre.network.provider.send("hardhat_setBalance", [
      (await deployments.get("Faucet")).address,
      "0x152d02c7e14af6800000", // 100k ETH
    ]);
  }
};

export default main;
main.dependencies = ["setup"];
main.tags = ["faucet"];
