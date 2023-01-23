import { formatEther, parseEther } from "ethers/lib/utils";
import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Anvil, getSetup, Hardhat } from "./utils";

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer } = await getSetup(hre);

  await mintTestPOP((await deployments.get("TestPOP")).address, signer, (await signer.getAddress()) as string, hre);
  await mintTestPOP((await deployments.get("TestPOP")).address, signer, addresses.daoTreasury as string, hre);
  const provider = ["remote_fork"].includes(hre.network.name) ? Anvil : Hardhat;
  await provider.setBalance(addresses.daoTreasury);
  // This is only needed when using a remote fork
  // await transferPOP(signer, (await signer.getAddress()) as string, hre, addresses);
};

const transferPOP = async (signer: any, recipient: string, hre: HardhatRuntimeEnvironment, addresses) => {
  const provider = ["remote_fork"].includes(hre.network.name) ? Anvil : Hardhat;
  await provider.setBalance(addresses.daoTreasury);
  const dao = await provider.impersonateSigner(addresses.daoTreasury);
  const pop = await hre.ethers.getContractAt("MockERC20", addresses.pop, dao);

  console.log("transferring POP to deployer ...");
  await pop.connect(dao).transfer(recipient, parseEther("100000"));
  await provider.stopImpersonating(addresses.daoTreasury);
};

const mintTestPOP = async (address: string, signer: any, recipient: string, hre: HardhatRuntimeEnvironment) => {
  const POP = await hre.ethers.getContractAt("MockERC20", address, signer);
  console.log(`Minting ${await POP.symbol()} for`, recipient, "at ", address);
  await (await POP.mint(recipient, parseEther("50000000"))).wait(1);
  console.log("Total POP supply", formatEther(await POP.totalSupply()));
};

module.exports = main;
export default main;
main.dependencies = ["setup", "test-pop"];
main.tags = ["LBP", "frontend", "mint-pop"];
