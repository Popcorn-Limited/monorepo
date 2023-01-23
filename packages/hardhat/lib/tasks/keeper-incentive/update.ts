import { utils } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { task } from "hardhat/config";
interface Args {
  index: string;
  contractAddress: string;
  reward: string;
  enabled: string;
  permissionless: string;
  rewardToken: string;
  cooldown: string;
  burnRate?: string;
}
export default task("keeper-incentive:update", "updates keeper incentive")
  .addParam("index", "index of incentive")
  .addParam("contractAddress", "address of contract")
  .addParam("reward", "reward amount")
  .addParam("enabled", "1 for enabled, 0 for disabled")
  .addParam("permissionless", "1 for permissionless, 0 to require keeper role")
  .addParam("rewardToken", "token to receive incentives in")
  .addParam("cooldown", "length of time required to wait until next allowable invocation")
  .addOptionalParam(
    "burnRate",
    "Percentage in Mantissa. (1e14 = 1 Basis Point) - if rewardToken is POP token and _burnRate is 0, will default to contract defined burnRate"
  )
  .setAction(async (args: Args, hre) => {
    const signer = hre.ethers.provider.getSigner();
    const keeperIncentive = await hre.ethers.getContractAt(
      "KeeperIncentiveV2",
      (
        await hre.deployments.get("KeeperIncentiveV2")
      ).address,
      signer
    );

    const tx = await keeperIncentive.updateIncentive(
      args.contractAddress,
      parseInt(args.index),
      parseEther(args.reward),
      Boolean(parseInt(args.enabled)),
      Boolean(parseInt(args.permissionless)),
      args.rewardToken,
      parseInt(args.cooldown),
      parseInt(args.burnRate || "0")
    );

    const receipt = await tx.wait(1);
    console.log(receipt);
  });
