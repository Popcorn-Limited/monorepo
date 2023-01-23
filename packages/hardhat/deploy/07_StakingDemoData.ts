import { formatEther, parseEther } from "ethers/lib/utils";
import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { MockERC20 } from "../typechain";
import { getSetup, Hardhat, Anvil } from "./utils";
import { constants } from "ethers";

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, addresses, signer } = await getSetup(hre);

  if (["hardhat", "local", "remote_fork"].includes(hre.network.name)) {
    await createPopLockerData(hre, deployments, signer, addresses);
  }
};
export default main;
main.dependencies = ["setup"];
main.tags = ["frontend", "staking-demo-data"];

async function createPopLockerData(hre, deployments, signer, addresses): Promise<void> {
  const deployerAddress = await signer.getAddress();
  console.log("popLockerData");
  const popAddress = (await deployments.get("TestPOP")).address;
  await connectAndMintToken(popAddress, signer, hre, addresses);

  const rewardsDistribution = await hre.ethers.getContractAt(
    "RewardsDistribution",
    await (
      await deployments.get("RewardsDistribution")
    ).address
  );

  const stakingContract = await hre.ethers.getContractAt(
    "PopLocker",
    await (
      await deployments.get("PopLocker")
    ).address
  );
  console.log("rewardsDistro");
  const isConfigured: boolean = await (async () => {
    let configured = false;
    try {
      configured = (await rewardsDistribution.rewardDistributors(0)).length ? true : false;
    } catch (e) {
      configured = false;
    }
    return configured;
  })();

  if (!isConfigured) {
    await rewardsDistribution.connect(signer).addRewardDistribution(stakingContract.address, parseEther("1000"), true);
    console.log("updated rewards distro");
  }

  const provider = ["remote_fork"].includes(hre.network.name) ? Anvil : Hardhat;

  console.log("impersonating dao ...");
  const daoTreasury = await provider.impersonateSigner(addresses.daoTreasury);

  const pop = await hre.ethers.getContractAt("MockERC20", popAddress, daoTreasury);

  console.log(
    "POP balance of daoTreasury ",
    formatEther(await pop.balanceOf(addresses.daoTreasury)),
    addresses.daoTreasury
  );

  console.log("transferring POP to rewards distribution and to deployer ...");
  await pop.connect(daoTreasury).transfer(rewardsDistribution.address, parseEther("20000"));
  await pop.connect(daoTreasury).transfer(deployerAddress, parseEther("10000"));
  await provider.stopImpersonating(addresses.daoTreasury);

  const deployer = await provider.impersonateSigner(deployerAddress);
  console.log("zeroing out approvals on staking and rewards contracts ...");

  await pop.connect(deployer).approve(stakingContract.address, parseEther("0"));
  await pop.connect(deployer).approve(rewardsDistribution.address, parseEther("0"));

  console.log("approving again");

  await pop.connect(deployer).approve(stakingContract.address, parseEther("1000"));
  await pop.connect(deployer).approve(rewardsDistribution.address, parseEther("20000"));
  console.log("approved");

  console.log(
    "POP balance of deployer ",
    formatEther(await pop.connect(deployer).balanceOf(deployerAddress)),
    deployerAddress
  );

  console.log({
    rewardsDistribution: rewardsDistribution.address,
    deployer: await signer.getAddress(),
    stakingContract: stakingContract.address,
  });

  console.log("getting allowance ...");
  console.log(
    "allowance of PopLocker contract",
    formatEther(await pop.connect(deployer).allowance(deployerAddress, stakingContract.address))
  );
  console.log(
    "allowance of rewardsDistribution contract",
    formatEther(await pop.connect(deployer).allowance(deployerAddress, rewardsDistribution.address))
  );

  console.log("DISTRIBUTIONS", await rewardsDistribution.distributions(0));
  console.log("StakingToken", await stakingContract.stakingToken());
  //Create withdrawable balance
  const lockedBalance = await stakingContract.connect(deployer).lockedBalances(await deployer.getAddress());
  if (lockedBalance.locked.eq(constants.Zero)) {
    console.log("distributing rewards ...");
    await rewardsDistribution.connect(deployer).distributeRewards();
    console.log("locking pop ...");
    await stakingContract.connect(deployer).lock(deployerAddress, parseEther("10"), 0);
    await stakingContract.connect(deployer).lock(deployerAddress, parseEther("10"), 0);
  }
}

async function connectAndMintToken(
  tokenAddress: string,
  signer: any,
  hre: HardhatRuntimeEnvironment,
  addresses
): Promise<MockERC20> {
  const POP = await hre.ethers.getContractAt("MockERC20", tokenAddress, signer);
  await POP.mint(await signer.getAddress(), parseEther("100000"));

  // const provider = ["remote_fork"].includes(hre.network.name) ? Anvil : Hardhat;
  // const dao = await provider.impersonateSigner(addresses.daoTreasury);
  // await provider.setBalance(addresses.daoTreasury);
  // const tx = await POP.connect(dao).transfer(await signer.getAddress(), parseEther("100000"));
  // await wait(tx, hre);
  // await provider.stopImpersonating(addresses.daoTreasury);
  return POP;
}
