import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import LBPFactoryAbi from "../../../lib/external/balancer/LBPFactory.json";
import { getNamedAccountsFromNetwork } from "../../utils/getNamedAccounts";

interface Args {
  to: string;
  amount: string;
}

async function main(args: Args, hre: HardhatRuntimeEnvironment) {
  const { BalancerLBPFactory, USDC, POP } = getNamedAccountsFromNetwork(hre);

  const signer = hre.askForSigner();

  const deployedLbp = ethers.ContractFactory.getContract(
    BalancerLBPFactory,
    JSON.stringify(LBPFactoryAbi),
    signer
  );

  console.log({ POP, USDC });

  console.log("deploying LBP");
  const tx = await deployedLbp.create(
    "Test TPOP LBP Copper Launch",
    "TPOP3_FLA",
    [USDC, POP],
    [parseEther(".01"), parseEther(".99")],
    parseEther(".015"),
    signer.address,
    false
    //{ gasLimit: 5000000 }
  );

  const receipt = await tx.wait(1);
  console.log("LBP deployed");
  console.log(receipt);
}

export default task("LBP:deploy", "deploys LBP with factory").setAction(main);
