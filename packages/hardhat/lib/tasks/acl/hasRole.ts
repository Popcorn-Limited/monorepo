import { ethers } from "ethers";
import { task } from "hardhat/config";
interface Args {
  role: string;
  address: string;
}
export default task("acl:has-role", "check if address has role")
  .addParam("address", "account to check")
  .addParam("role", "role to check")
  .setAction(async (args: Args, hre) => {
    const aclAddress = (await hre.deployments.get("ACLRegistry")).address;
    const acl = await hre.ethers.getContractAt("ACLRegistry", aclAddress);
    const hasRole = await acl.hasRole(ethers.utils.id(args.role), args.address);
    console.log(
      args.address,
      hasRole ? " has" : "does not have",
      "role",
      args.role
    );
  });
