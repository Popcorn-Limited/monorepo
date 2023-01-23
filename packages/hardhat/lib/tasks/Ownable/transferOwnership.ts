import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
interface Args {
  contract: string;
  owner: string;
}

async function main(args: Args, hre: HardhatRuntimeEnvironment) {
  const signer = hre.askForSigner();

  const contract = await hre.ethers.getContractAt(
    "IOwnable",
    args.contract,
    signer
  );

  console.log("Transfering ownership of", args.contract, "to ", args.owner);

  const tx = await contract.transferOwnership(args.owner);
  const receipt = await tx.wait(1);
  console.log(receipt);
  console.log("Transferred Ownership");
}

export default task(
  "ownable:transferOwnership",
  "transfers ownership of contract"
)
  .addParam("contract", "contract address")
  .addParam("owner", "new owner address")
  .setAction(main);
