import { LedgerSigner } from "@ethersproject/hardware-wallets";
import { parseEther } from "ethers/lib/utils";
import fs from "fs";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";
import { chunkArray, isAddress } from "./helpers";

interface Args {
  token: string;
  csv: string;
  halve?: string;
}

async function main(args: Args, hre: HardhatRuntimeEnvironment) {
  const signer = await getSigner(hre);
  const address = (await hre.deployments.get("Superseeder")).address;
  const seeder = await hre.ethers.getContractAt("Superseeder", address, signer);
  console.log(path.join(process.env.INIT_CWD, args.csv));
  const csv = fs.readFileSync(
    path.join(process.env.INIT_CWD, args.csv),
    "utf-8"
  );
  const allocations = csv2json(csv, ",", args);

  const chunks = chunkArray(allocations, 100);

  let totalDelivered = 0;
  while (chunks.length > 0) {
    const chunk = chunks.pop();
    console.log("dropping:", chunk);
    const tx = await seeder.seed(
      args.token,
      chunk.map((user) => user[0]),
      chunk.map((user) => parseEther(user[1].toString()))
      //  { gasLimit: 6000000 }
    );
    console.log(`
    delivered to ${(totalDelivered += chunk.length)} addresses
    batches remaining: ${chunks.length}
  `);
    await tx.wait(1);
  }
}

const csv2json = (str, delimiter = ",", args) => {
  const titles = str.slice(0, str.indexOf("\n")).split(delimiter);
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");
  return rows.map((row) => {
    const values = row.split(delimiter);
    if (!isAddress(values[0])) {
      throw "invalid address: " + values[0];
    }
    return [values[0], args.halve ? values[1] / 2 : values[1]];
  });
};

const getSigner = async (hre: HardhatRuntimeEnvironment) => {
  let signer;
  if (["hardhat", "local", "localhost"].includes(hre.network.name)) {
    signer = (await hre.ethers.getSigners())[0];
  }
  if (Boolean(parseInt(process.env.HARDWARE_WALLET || "0"))) {
    const ledger = await new LedgerSigner(
      hre.ethers.provider,
      "hid",
      "44'/60'/0'/0/0"
    );
    signer = ledger;
  } else {
    signer = hre.askForSigner();
  }
  return signer;
};

export default task("superseeder:seed", "burns TPOP")
  .addParam("csv", "path to csv file")
  .addParam("token", "token to transfer")
  .addOptionalParam("halve", "amounts will be halved")
  .setAction(main);
