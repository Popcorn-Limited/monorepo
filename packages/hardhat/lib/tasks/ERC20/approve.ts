import { parseEther } from "ethers/lib/utils";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
interface Args {
  token: string;
  spender: string;
  amount: string;
}

async function main(args: Args, hre: HardhatRuntimeEnvironment) {
  const erc20 = await hre.ethers.getContractAt("MockERC20", args.token);

  console.log(
    "Approving ",
    args.spender,
    "to spend ",
    parseEther(args.amount).toString(),
    " ",
    await erc20.symbol()
  );

  await erc20.approve(args.spender, parseEther(args.amount));
}

export default task("ERC20:approve", "approves spending by spender")
  .addParam("token", "token address")
  .addParam("spender", "spender address")
  .addParam("amount", "amount to approve")
  .setAction(main);
