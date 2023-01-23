import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { addContractToRegistry, getSetup } from "./utils";

const contract_name = "RewardsEscrow";
const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer } = await getSetup(hre);
  const { pop } = addresses;

  const isLocalNetwork = !["mainnet", "polygon", "arbitrum", "bsc", "remote_fork"].includes(hre.network.name);
  const popAddress = isLocalNetwork ? (await deployments.get("TestPOP")).address : pop;

  const deployed = await deploy(contract_name, {
    from: await signer.getAddress(),
    args: [popAddress],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  const VaultsRewardsEscrow_deployed = await deploy("VaultsRewardsEscrow", {
    from: await signer.getAddress(),
    args: [popAddress],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    contract: "RewardsEscrow",
  });

  await addContractToRegistry("RewardsEscrow", deployments, signer, hre);
  await addContractToRegistry("VaultsRewardsEscrow", deployments, signer, hre);
};
export default main;

main.dependencies = ["setup", "contract-registry", "test-pop"];
main.tags = ["core", "frontend", "rewards-escrow"];
