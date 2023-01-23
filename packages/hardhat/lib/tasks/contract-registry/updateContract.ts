import { ethers } from "ethers";
import { task } from "hardhat/config";
interface Args {
  contractName: string;
  contractVersion: string;
  address: string;
}
export default task("contract-registry:update", "updates contract in registry")
  .addParam("address", "address of contract")
  .addParam("contractName", "name of contract")
  .addParam("contractVersion", "contract version")
  .setAction(async (args: Args, hre) => {
    const { contractName, contractVersion, address } = args;
    const registryAddress = (await hre.deployments.get("ContractRegistry"))
      .address;
    const signer = hre.ethers.provider.getSigner();
    const registry = await hre.ethers.getContractAt(
      "ContractRegistry",
      registryAddress
    );
    const tx = await registry.updateContract(
      ethers.utils.id(contractName),
      address,
      ethers.utils.id(contractVersion),
      { gasLimit: 1000000 }
    );
    const receipt = await tx.wait(1);
    console.log(receipt);
  });
