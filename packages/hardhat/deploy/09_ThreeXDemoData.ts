import { formatEther, parseEther } from "ethers/lib/utils";
import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getSetup, Anvil, Hardhat } from "./utils";

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer } = await getSetup(hre);
  const pop = ["mainnet", "polygon", "bsc", "arbitrum"].includes(hre.network.name)
    ? addresses.pop
    : (await deployments.get("TestPOP")).address;

  if (["hardhat", "local", "localhost", "remote_fork"].includes(hre.network.name)) {
    await mintXPOP((await deployments.get("XPop")).address, signer, hre.config.namedAccounts.deployer as string, hre);
    await mintPOP(pop, signer, (await deployments.get("xPopRedemption")).address, hre, addresses);
  }
};

const mintXPOP = async (address: string, signer: any, recipient: string, hre: HardhatRuntimeEnvironment) => {
  const POP = await hre.ethers.getContractAt("MockERC20", address, signer);
  console.log(`Minting ${await POP.symbol()} for`, recipient);
  await (await POP.mint(recipient, parseEther("1000000000"))).wait(1);
  console.log(`Total ${await POP.symbol()} supply`, formatEther(await POP.totalSupply()));
};

const mintPOP = async (address: string, signer: any, recipient: string, hre: HardhatRuntimeEnvironment, addresses) => {
  const provider = ["remote_fork"].includes(hre.network.name) ? Anvil : Hardhat;
  const POP = await hre.ethers.getContractAt("MockERC20", address, signer);
  const dao = await provider.impersonateSigner(addresses.daoTreasury);
  await (await POP.connect(dao).transfer(recipient, parseEther("1000000"))).wait(1);
  await provider.stopImpersonating(addresses.daoTreasury);
  console.log("Total POP supply", formatEther(await POP.totalSupply()));
};

module.exports = main;
export default main;
main.dependencies = ["setup", "xpop-redemption"];
main.tags = ["frontend", "xpop-redemption-demo-data"];
