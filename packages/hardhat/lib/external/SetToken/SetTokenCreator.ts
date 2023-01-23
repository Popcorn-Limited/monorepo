import { SetTokenCreator__factory } from "@setprotocol/set-protocol-v2/dist/typechain";
import { BigNumber, ContractReceipt, Signer } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import FactoryMetapoolABI from "../curve/FactoryMetapool.json";
import YearnV2VaultABI from "../yearn/V2Vault.json";
import { Configuration, DefaultConfiguration } from "./Configuration";
import { getComponents } from "./utils/getComponents";
import { getModules } from "./utils/getModules";

interface SetTokenCreator {
  _calculateUnits(component: Configuration["components"][0]): Promise<BigNumber>;
  create: (signer: Signer) => Promise<ContractReceipt>;
}

interface Args {
  configuration?: Configuration;
  debug?: boolean;
  hre: HardhatRuntimeEnvironment;
}

export default function SetTokenCreator({ configuration, debug, hre }: Args): SetTokenCreator {
  const { targetNAV } = configuration ? configuration : DefaultConfiguration;

  return {
    _calculateUnits: async function (component: Configuration["components"][0]): Promise<BigNumber> {
      if (component.amount) {
        return component.amount;
      }
      const yVault = await hre.ethers.getContractAt(YearnV2VaultABI, component.address);

      const curveLP = await hre.ethers.getContractAt(FactoryMetapoolABI, component.oracle);

      const targetComponentValue = targetNAV.mul(parseEther(component.ratio.toString())).div(parseEther("100"));

      console.log("getting price per share of", component);
      const pricePerShare = (await yVault.pricePerShare()) as BigNumber;
      console.log("got price per share", formatEther(pricePerShare));
      const virtualPrice = (await curveLP.get_virtual_price()) as BigNumber;

      const targetCrvLPUnits = targetComponentValue.mul(parseEther("1")).div(virtualPrice);

      const targetComponentUnits = targetCrvLPUnits.mul(parseEther("1")).div(pricePerShare);

      if (debug) {
        console.log({
          targetNAV: formatEther(targetNAV),
          targetComponentValue: formatEther(targetComponentValue),
          pricePerShare: formatEther(pricePerShare),
          virtualPrice: formatEther(virtualPrice),
          targetCrvLPUnits: formatEther(targetCrvLPUnits),
          targetComponentUnits: formatEther(targetComponentUnits),
        });
      }

      return targetComponentUnits;
    },

    create: async function (signer: Signer): Promise<ContractReceipt> {
      const creator = SetTokenCreator__factory.connect(configuration.core.SetTokenCreator.address, signer);

      console.log("components");
      const setComponents = getComponents(configuration);
      console.log("setComponents", setComponents);
      const setModules = getModules(configuration);
      console.log("setModules", setModules);
      const tx = await creator.create(
        setComponents.map((component) => component.address),
        setComponents.map((component) => this._calculateUnits(component)),
        setModules.map((module) => module.address),
        configuration.manager,
        configuration.tokenName,
        configuration.tokenSymbol
      );

      console.log("waiting for block confirmation");
      const receipt = tx.wait(1);
      return receipt;
    },
  };
}
