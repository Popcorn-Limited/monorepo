import { task } from "hardhat/config";
interface Args {
  role: string;
  address: string;
}
export default task(
  "rewards-escrow:add-authorized-contract",
  "gives address permission to use rewards escrow"
)
  .addParam("address", "address to be authorized")
  .setAction(async (args: Args, hre) => {
    const rewardsEscrowAddress = (await hre.deployments.get("RewardsEscrow"))
      .address;
    const signer = hre.ethers.provider.getSigner();
    const rewardsEscrow = await hre.ethers.getContractAt(
      "RewardsEscrow",
      rewardsEscrowAddress
    );
    const tx = await rewardsEscrow
      .connect(signer)
      .addAuthorizedContract(args.address);
    const receipt = await tx.wait(1);
    console.log(receipt);
  });
