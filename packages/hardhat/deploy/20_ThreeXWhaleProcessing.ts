import { DeployFunction, DeploymentsExtension } from "@anthonymartin/hardhat-deploy/types";
import { BigNumber, ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getSignerFrom } from "../lib/utils/getSignerFrom";
import { addContractToRegistry, getSetup } from "./utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer } = await getSetup(hre);
  const { threeXStaking, threePool, threeX, dai, usdc, usdt } = addresses;

  //ContractRegistry
  const contractRegistryAddress = (await deployments.get("ContractRegistry")).address;

  //Butter Batch
  console.log("deploying threeXWhaleProcessing...");

  await deploy("ThreeXWhaleProcessing", {
    from: await signer.getAddress(),
    args: [
      contractRegistryAddress,
      addresses.setBasicIssuanceModule,
      (await deployments.get("threeXStaking")).address,
      threePool,
      [dai, usdc, usdt],
    ],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  console.log("adding ThreeXWhaleProcessing to contract registry...");
  await addContractToRegistry("ThreeXWhaleProcessing", deployments, signer, hre);

  const processingContractAdress = (await deployments.get("ThreeXWhaleProcessing")).address;
  const processingContract = await hre.ethers.getContractAt("ThreeXWhaleProcessing", processingContractAdress, signer);

  console.log("setting ThreeXWhaleProcessing approvals ... ");
  const approvalsTx = await processingContract.setApprovals();
  if (!["hardhat", "local", "remote_fork"].includes(hre.network.name)) {
    await approvalsTx.wait();
  }

  console.log("Setting Fees for ThreeXWhaleProcessing");
  await processingContract.setFee(ethers.utils.formatBytes32String("mint"), 75, ethers.constants.AddressZero, threeX);
  await processingContract.setFee(ethers.utils.formatBytes32String("redeem"), 75, ethers.constants.AddressZero, usdc);

  console.log("setting ACLRegistry Roles for ThreeXWhaleProcessing");
  const aclRegistry = await hre.ethers.getContractAt(
    "ACLRegistry",
    (
      await deployments.get("ACLRegistry")
    ).address,
    signer
  );
  await aclRegistry.grantRole(ethers.utils.id("ApprovedContract"), processingContractAdress);
  await aclRegistry.grantRole(ethers.utils.id("Keeper"), processingContractAdress);
  console.log(`Finished deploying ThreeXWhaleProcessing at ${processingContractAdress}`);
};

export default func;

func.dependencies = ["setup", "acl-registry", "contract-registry", "3x"];
func.tags = ["frontend", "3x-whale"];
