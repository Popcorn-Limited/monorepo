import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { DeploymentsExtension } from "@anthonymartin/hardhat-deploy/dist/types";
import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ButterBatchProcessing } from "../typechain";
import { Anvil, getSetup, Hardhat } from "./utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, deployments, addresses, signer } = await getSetup(hre);
  const pop = ["mainnet", "polygon", "bsc", "arbitrum"].includes(hre.network.name)
    ? addresses.pop
    : (await deployments.get("TestPOP")).address;

  if (["hardhat", "local", "remote_fork"].includes(hre.network.name)) {
    const butterBatch = await hre.ethers.getContractAt(
      "ButterBatchProcessing",
      (
        await deployments.get("ButterBatchProcessing")
      ).address,
      signer
    );
    const keeperIncentive = await hre.ethers.getContractAt(
      "KeeperIncentiveV2",
      (
        await deployments.get("KeeperIncentive")
      ).address,
      signer
    );
    await keeperIncentive.updateIncentive(butterBatch.address, 0, 0, true, true, pop, 1, 0);
    await keeperIncentive.updateIncentive(butterBatch.address, 1, 0, true, true, pop, 1, 0);

    await createDemoData(butterBatch, hre, deployments, signer, await signer.getAddress(), deploy, addresses);
  }
};

async function createDemoData(
  butterBatch: ButterBatchProcessing,
  hre: HardhatRuntimeEnvironment,
  deployments: DeploymentsExtension,
  signer: ethers.Signer,
  signerAddress: string,
  deploy: Function,
  addresses: any
): Promise<void> {
  console.log("creating demo data...");
  await butterBatch.connect(signer).setSlippage(200, 200);

  const threeCrv = await hre.ethers.getContractAt("MockERC20", addresses.threeCrv, signer);
  const butter = await hre.ethers.getContractAt("MockERC20", addresses.butter, signer);

  //Faucet
  await deploy("Faucet", {
    from: await signer.getAddress(),
    args: [addresses.uniswapRouter /* addresses.curveAddressProvider, addresses.curveFactoryMetapoolDepositZap */],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    contract: "Faucet",
  });
  const faucet = await hre.ethers.getContractAt("Faucet", (await deployments.get("Faucet")).address, signer);

  const provider = ["remote_fork"].includes(hre.network.name) ? Anvil : Hardhat;
  await provider.setBalance(faucet.address);

  console.log("sending 3crv...");
  await faucet.sendThreeCrv(1000, signerAddress);
  console.log("sending dai...");
  await faucet.sendTokens(addresses.dai, 1000, signerAddress);

  await threeCrv.approve(butterBatch.address, parseEther("130000"));
  await butter.approve(butterBatch.address, parseEther("2"));

  console.log("first butter mint");
  const mintId0 = await butterBatch.currentMintBatchId();
  await butterBatch.depositForMint(parseEther("120000"), signerAddress);
  await butterBatch.batchMint();
  await butterBatch.claim(mintId0, signerAddress);

  console.log("second butter mint");
  await butterBatch.depositForMint(parseEther("10000"), signerAddress);
  await butterBatch.batchMint();

  console.log("redeeming....");
  await butterBatch.depositForRedeem(parseEther("1"));
  await butterBatch.batchRedeem();

  console.log("create batch to be redeemed");
  await butterBatch.depositForRedeem(parseEther("1"));
}

export default func;
func.dependencies = ["setup", "butter", "test-pop", "staking"];
func.tags = ["frontend", "butter-demo-data"];
