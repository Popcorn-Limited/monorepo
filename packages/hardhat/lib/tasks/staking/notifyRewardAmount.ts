import { parseUnits } from "ethers/lib/utils";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import readlineSync from "readline-sync";

interface Args {
  address: string;
  amount: string;
  skipConfirmation: string;
}

export default task(
  "staking:notify-reward-amount",
  "notifies and transfers reward token to staking contract"
)
  .addParam("address", "address of contract")
  .addParam("amount", "amount to transfer to staking contract")
  .addOptionalParam("skipConfirmation", "will skip confirmation")
  .setAction(async (args: Args, hre: HardhatRuntimeEnvironment) => {
    const { amount, address, skipConfirmation } = args;
    const staking = await hre.ethers.getContractAt("Staking", address);
    const stakingTokenAddress = await staking.stakingToken();
    const stakingToken = await hre.ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
      stakingTokenAddress
    );

    const stakingTokenName = await stakingToken.name();
    const rewardsTokenAddress = await staking.rewardsToken();
    const rewardsToken = await hre.ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
      rewardsTokenAddress
    );
    const rewardAmount = parseUnits(amount, await rewardsToken.decimals());
    if (
      Boolean(parseInt(skipConfirmation || "0")) ||
      readlineSync.keyInYN(
        `Are you sure you want to transfer ${rewardAmount} to Staking contract for ${stakingTokenName} at ${address}?`
      )
    ) {
      console.log("preparing tx for Staking");
      const tx = await staking.notifyRewardAmount(
        parseUnits(amount, await rewardsToken.decimals())
      );
      const receipt = await tx.wait(1);
      console.log(receipt);
      console.log(
        `notifyRewardAmount complete: transfered ${rewardAmount} to Staking contract for ${stakingTokenName} at ${address}`
      );
    }
  });
