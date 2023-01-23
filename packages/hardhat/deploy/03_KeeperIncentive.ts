import { BigNumber } from "@ethersproject/bignumber";
import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { addContractToRegistry, getSetup } from "./utils";

const contract_name = "KeeperIncentive";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer } = await getSetup(hre);

  const deployed = await deploy("KeeperIncentive", {
    from: await signer.getAddress(),
    args: [(await deployments.get("ContractRegistry")).address, BigNumber.from("0"), BigNumber.from("0")],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    contract: "KeeperIncentiveV2",
    // gasLimit: 2000000,
  });

  await addContractToRegistry("KeeperIncentive", deployments, signer, hre);
};
export default func;
func.dependencies = ["setup", "contract-registry"];
func.tags = ["keeper-incentives", "frontend"];
