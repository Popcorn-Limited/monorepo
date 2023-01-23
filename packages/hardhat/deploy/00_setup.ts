import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getNamedAccountsFromNetwork } from "../lib/utils/getNamedAccounts";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  let signer;
  let deployer;

  if (["hardhat", "local"].includes(hre.network.name)) {
    signer = (await hre.ethers.getSigners())[0]; //Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    deployer = signer.address;

    await hre.network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: process.env.FORKING_RPC_URL,
            blockNumber: process.env.DEPLOYMENT_BLOCK_NUMBER ? process.env.DEPLOYMENT_BLOCK_NUMBER : undefined,
          },
        },
      ],
    });
  } else if (["remote_fork"].includes(hre.network.name)) {
    signer = (await hre.ethers.getSigners())[0]; //Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    deployer = signer.address;
  } else if (Boolean(parseInt(process.env.HARDWARE_WALLET || "0"))) {
    deployer = process.env.HARDWARE_WALLET;
  } else {
    signer = hre.askForSigner();
    deployer = `privateKey://${signer.privateKey}`;
  }
  hre.config.namedAccounts = {
    deployer: deployer,
    ...getNamedAccountsFromNetwork(hre),
  };
};

export default func;
func.tags = ["setup"];
