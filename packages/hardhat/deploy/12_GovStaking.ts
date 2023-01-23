import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { addContractToRegistry, getSetup } from "./utils";

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer } = await getSetup(hre);

  await deploy("GovStaking", {
    from: await signer.getAddress(),
    args: [(await deployments.get("ContractRegistry")).address],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    contract: "GovStaking",
  });
  await addContractToRegistry("GovStaking", deployments, signer, hre);
  const rewardsEscrow = await hre.ethers.getContractAt(
    "RewardsEscrow",
    await (
      await deployments.get("RewardsEscrow")
    ).address,
    signer
  );
  let tx = await rewardsEscrow.addAuthorizedContract((await deployments.get("GovStaking")).address);
  await tx.wait();
};
export default main;
main.dependencies = ["setup", "contract-registry", "rewards-escrow"];
main.tags = ["core", "gov-staking", "grants"];
