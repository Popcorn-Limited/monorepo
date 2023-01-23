import { ethers } from "ethers";
import { task } from "hardhat/config";
interface Args {
  role: string;
  address: string;
}
export default task("acl:grant-role", "grant ACLRegistry role to address")
  .addParam("address", "address to be granted role")
  .addParam("role", "name of role to grant")
  .setAction(async (args: Args, hre) => {
    const aclAddress = (await hre.deployments.get("ACLRegistry")).address;
    const signer = hre.ethers.provider.getSigner();
    const acl = await hre.ethers.getContractAt("ACLRegistry", aclAddress);
    const tx = await acl
      .connect(signer)
      .grantRole(ethers.utils.id(args.role), args.address);
    const receipt = await tx.wait(1);
    console.log(receipt);
  });
