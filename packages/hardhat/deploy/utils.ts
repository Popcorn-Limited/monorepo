import { HardhatRuntimeEnvironment } from "hardhat/types";
import { parseEther } from "ethers/lib/utils";
import { getSignerFrom } from "../lib/utils/getSignerFrom";
import { getNamedAccountsFromNetwork } from "../lib/utils/getNamedAccounts";
import { Signer } from "ethers/lib/ethers";
import { ethers, network } from "hardhat";
const { Table } = require("console-table-printer");

export const addContractToRegistry = async (
  contractName: string,
  deployments,
  signer,
  hre: HardhatRuntimeEnvironment,
  address?: string
) => {
  TablePrinter.addRow({
    contract_name: contractName,
    address: address ? address : (await deployments.get(contractName)).address,
  });
  if (address) {
    return;
  }
  const contractRegistry = await hre.ethers.getContractAt(
    "ContractRegistry",
    (
      await deployments.get("ContractRegistry")
    ).address,
    signer
  );

  const contract = (await contractRegistry.getContract(ethers.utils.id(contractName))) as string;
  const deployedAddress = (await deployments.get(contractName)).address;

  if (contract.toLowerCase() === deployedAddress.toLowerCase()) {
    console.log(`Skip Adding ${contractName} to registry - Identical Address`);
    return;
  }

  TablePrinter.log(`Adding contract ${contractName} to registry`);
  if (contract === ethers.constants.AddressZero) {
    await contractRegistry.addContract(ethers.utils.id(contractName), deployedAddress, ethers.utils.id("1"), {
      gasLimit: 1000000,
    });
  } else {
    TablePrinter.log(`${contractName} already exists in registry, updating entry ...`);

    const tx = await contractRegistry.updateContract(
      ethers.utils.id(contractName),
      deployedAddress,
      ethers.utils.id("2" + new Date().getTime().toString()),
      { gasLimit: 1000000 }
    );
    await wait(tx, hre);
  }
};

export const FaucetController = async (hre, signer) => {
  const initialize = await (() =>
    async function (hre: HardhatRuntimeEnvironment, signer) {
      const faucetAddress = (await hre.deployments.get("Faucet")).address;
      if ((await hre.ethers.provider.getBalance(faucetAddress)).lt(parseEther("100000"))) {
        await hre.network.provider.send("hardhat_setBalance", [
          faucetAddress,
          "0x152d02c7e14af6800000", // 100k ETH
        ]);
      }
      return hre.ethers.getContractAt("Faucet", faucetAddress, signer);
    })();

  const _faucet = await initialize(hre, signer);
  const _addresses = await getNamedAccountsFromNetwork(hre);

  return {
    faucet: _faucet,
    sendDai: async (recipient, amount: number) => {
      console.log("sending dai...");
      await _faucet.sendTokens(_addresses.dai, amount, recipient);
    },

    sendUsdc: async (recipient, amount: number) => {
      console.log("sending usdc...");
      await _faucet.sendTokens(_addresses.usdc, amount, recipient);
    },

    sendCrvSethLPTokens: async (recipient, amount) => {
      return _faucet.sendCrvSethLPTokens(amount, recipient);
    },
  };
};

export async function wait(tx, hre) {
  if (!["hardhat", "local", "remote_fork"].includes(hre.network.name)) {
    await tx.wait();
  }
}

export const Hardhat = {
  impersonateSigner: async (address): Promise<Signer> => {
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [address],
    });
    return ethers.getSigner(address);
  },
  stopImpersonating: async (address): Promise<Signer> => {
    await network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [address],
    });
    return ethers.getSigner(address);
  },
  setBalance: async (address): Promise<void> => {
    await network.provider.request({
      method: "hardhat_setBalance",
      params: [address, "0x152d02c7e14af6800000"],
    });
  },
};

export const Anvil = {
  stopImpersonating: async (address): Promise<Signer> => {
    await network.provider.request({
      method: "anvil_stopImpersonatingAccount",
      params: [address],
    });
    return ethers.getSigner(address);
  },
  impersonateSigner: async (address): Promise<Signer> => {
    await network.provider.request({
      method: "anvil_impersonateAccount",
      params: [address],
    });
    return ethers.getSigner(address);
  },
  setBalance: async (address): Promise<void> => {
    await network.provider.request({
      method: "anvil_setBalance",
      params: [address, "0x152d02c7e14af6800000"],
    });
  },
};

const _table = new Table({ title: "Deployed Contracts" });
const _rows = [];
export const TablePrinter = {
  addRow: ({ contract_name, address }) => {
    console.clear();
    _rows.push({ contract_name, address });
    _table.addRow({ contract_name, address });
    _table.printTable();
  },
  log: (...args) => {
    console.clear();
    _table.printTable();
    console.log(...args);
  },
};

export const getSetup = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments } = hre;
  const { deploy } = deployments;
  const addresses = getNamedAccountsFromNetwork(hre);
  const signer = await getSignerFrom(hre.config.namedAccounts.deployer as string, hre);
  return { deploy, deployments, addresses, signer, log: TablePrinter.log };
};
module.exports.skip = () => true;
