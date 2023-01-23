import { LedgerSigner } from "@ethersproject/hardware-wallets";
import { parseUnits } from "ethers/lib/utils";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
interface Args {
  token: string;
  recipient: string;
  amount: string;
}

async function main(args: Args, hre: HardhatRuntimeEnvironment) {
  const signer = await getSigner(hre);

  const erc20 = await hre.ethers.getContractAt("MockERC20", args.token, signer);

  console.log(
    "Transfering ",
    parseUnits(args.amount, await erc20.decimals()).toString(),
    erc20.symbol(),
    "to",
    args.recipient
  );

  await erc20.mint(
    args.recipient,
    parseUnits(args.amount, await erc20.decimals())
  );
}

const getSigner = async (hre: HardhatRuntimeEnvironment) => {
  let signer;
  if (["hardhat", "local", "localhost"].includes(hre.network.name)) {
    return (signer = (await hre.ethers.getSigners())[0]);
  }
  if (Boolean(parseInt(process.env.HARDWARE_WALLET || "0"))) {
    const ledger = await new LedgerSigner(
      hre.ethers.provider,
      "hid",
      "44'/60'/0'/0/0"
    );
    signer = ledger;
    return signer;
  } else {
    signer = hre.askForSigner();
  }
  return signer;
};

export default task("ERC20:mint", "transfers tokens to recipient")
  .addParam("token", "token address")
  .addParam("recipient", "spender address")
  .addParam("amount", "amount to send")
  .setAction(main);
