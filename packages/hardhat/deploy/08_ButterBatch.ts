import { BigNumber, ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { addContractToRegistry, getSetup } from "./utils";
import { INCENTIVE_MANAGER_ROLE } from "../lib/acl/roles";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer, log } = await getSetup(hre);
  const pop = ["mainnet", "polygon", "bsc", "arbitrum"].includes(hre.network.name)
    ? addresses.pop
    : (await deployments.get("TestPOP")).address;

  const YTOKEN_ADDRESSES = [addresses.yFrax, addresses.yRai, addresses.yMusd, addresses.yAlusd];
  const CRV_DEPENDENCIES = [
    {
      curveMetaPool: addresses.crvFraxMetapool,
      crvLPToken: addresses.crvFrax,
    },
    {
      curveMetaPool: addresses.crvRaiMetapool,
      crvLPToken: addresses.crvRai,
    },
    {
      curveMetaPool: addresses.crvMusdMetapool,
      crvLPToken: addresses.crvMusd,
    },
    {
      curveMetaPool: addresses.crvAlusdMetapool,
      crvLPToken: addresses.crvAlusd,
    },
  ];

  log(
    JSON.stringify(
      {
        YTOKEN_ADDRESSES,
        CRV_DEPENDENCIES,
      },
      null,
      2
    )
  );

  //ContractRegistry
  const contractRegistryAddress = (await deployments.get("ContractRegistry")).address;

  //Butter Batch
  log("deploying butterBatch...");
  const deployed = await deploy("ButterBatchProcessing", {
    from: await signer.getAddress(),
    args: [
      contractRegistryAddress,
      addresses.butterStaking,
      addresses.butter,
      addresses.threeCrv,
      addresses.threePool,
      addresses.setBasicIssuanceModule,
      YTOKEN_ADDRESSES,
      CRV_DEPENDENCIES,
      {
        batchCooldown: BigNumber.from("1"),
        mintThreshold: parseEther("1"),
        redeemThreshold: parseEther("0.1"),
      },
    ],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    contract: "ButterBatchProcessing",
  });

  await addContractToRegistry("ButterBatchProcessing", deployments, signer, hre);

  log("setting approvals for ButterBatchProcessing");
  const butterBatchProcessing = await hre.ethers.getContractAt(
    "ButterBatchProcessing",
    (
      await deployments.get("ButterBatchProcessing")
    ).address
  );
  await butterBatchProcessing.setApprovals();

  //Adding permissions and other maintance
  const keeperIncentive = await hre.ethers.getContractAt(
    "KeeperIncentiveV2",
    (
      await deployments.get("KeeperIncentive")
    ).address,
    signer
  );

  const aclRegistry = await hre.ethers.getContractAt(
    "ACLRegistry",
    (
      await deployments.get("ACLRegistry")
    ).address,
    signer
  );
  if (!Boolean(parseInt(process.env.UPDATE_ONLY || "0"))) {
    //Butter Batch Zapper
    log("deploying butterBatchZapper...");
    const zapper = await deploy("ButterBatchZapper", {
      from: await signer.getAddress(),
      args: [contractRegistryAddress, addresses.threePool, addresses.threeCrv],
      log: true,
      autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
      contract: "ButterBatchProcessingZapper",
    });
    await addContractToRegistry("ButterBatchZapper", deployments, signer, hre);

    log("granting ButterZapper role to ButterBatchZapper");
    await aclRegistry.grantRole(ethers.utils.id("ButterZapper"), (await deployments.get("ButterBatchZapper")).address);
    await aclRegistry.grantRole(INCENTIVE_MANAGER_ROLE, await signer.getAddress());

    log("granting ApprovedContract role to ButterBatchZapper");
    await aclRegistry.grantRole(
      ethers.utils.id("ApprovedContract"),
      (
        await deployments.get("ButterBatchZapper")
      ).address
    );

    log("creating incentive 1 ...");
    await keeperIncentive.createIncentive(butterBatchProcessing.address, 0, true, true, pop, 60 * 60 * 24, 0);

    log("creating incentive 2 ...");
    await keeperIncentive.createIncentive(butterBatchProcessing.address, 0, true, true, pop, 60 * 60 * 24, 0);
  }

  const zapperContract = await hre.ethers.getContractAt(
    "ButterBatchProcessingZapper",
    (
      await deployments.get("ButterBatchZapper")
    ).address
  );

  log("setting approvals for ButterBatchZapper ...");

  await zapperContract.setApprovals();
};

export default func;

func.dependencies = ["setup", "acl-registry", "contract-registry", "keeper-incentives"];
func.tags = ["frontend", "butter"];
