import { formatUnits, parseUnits } from "ethers/lib/utils";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import readlineSync from "readline-sync";
import { getNamedAccountsFromNetwork } from "../../utils/getNamedAccounts";

interface Args {
  amount: string;
  skipConfirmation: string;
}

export default task(
  "pop-locker:notify-reward-amount",
  "notifies and transfers reward token to staking contract"
)
  .addParam("amount", "amount to transfer to staking contract")
  .addOptionalParam("skipConfirmation", "will skip confirmation")
  .setAction(async (args: Args, hre: HardhatRuntimeEnvironment) => {
    const { amount, skipConfirmation } = args;
    const { pop } = getNamedAccountsFromNetwork(hre);
    const popLockerAddress = (await hre.deployments.get("PopLocker")).address;
    const staking = await hre.ethers.getContractAt(
      "PopLocker",
      popLockerAddress
    );
    const stakingTokenAddress = pop;
    const stakingToken = await hre.ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
      stakingTokenAddress
    );

    const stakingTokenName = await stakingToken.name();
    const rewardsToken = await hre.ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
      pop
    );
    const rewardAmount = parseUnits(amount, await rewardsToken.decimals());
    if (
      Boolean(parseInt(skipConfirmation || "0")) ||
      readlineSync.keyInYN(
        `Are you sure you want to transfer ${formatUnits(
          rewardAmount,
          await rewardsToken.decimals()
        )} to Staking contract for ${stakingTokenName} at ${popLockerAddress}?`
      )
    ) {
      console.log("preparing tx for PopLocker ... ");
      const tx = await staking.notifyRewardAmount(
        pop,
        parseUnits(amount, await rewardsToken.decimals())
      );
      const receipt = await tx.wait(1);
      console.log(receipt);
      console.log(
        `notifyRewardAmount complete: transfered ${rewardAmount} to Staking contract for ${stakingTokenName} at ${popLockerAddress}`
      );
    }
  });
