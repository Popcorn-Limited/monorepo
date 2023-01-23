import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

interface Args {
  distributorAddress: string;
  rewardsTokenAddress: string;
  useBoost: string;
}

export default task(
  "pop-locker:add-reward",
  "adds reward to poplocker contract"
)
  .addParam("distributorAddress", "distributor address")
  .addParam("rewardsTokenAddress", "rewards token address")
  .addParam("useBoost", "use boost")
  .addOptionalParam("skipConfirmation", "will skip confirmation")
  .setAction(async (args: Args, hre: HardhatRuntimeEnvironment) => {
    const { distributorAddress, rewardsTokenAddress, useBoost } = args;
    const popLockerAddress = (await hre.deployments.get("PopLocker")).address;
    const staking = await hre.ethers.getContractAt(
      "PopLocker",
      popLockerAddress
    );

    console.log("preparing to add reward for PopLocker ... ");
    const tx = await staking.addReward(
      rewardsTokenAddress,
      distributorAddress,
      Boolean(parseInt(useBoost || "0"))
    );
    const receipt = await tx.wait(1);
    console.log(receipt);
  });
