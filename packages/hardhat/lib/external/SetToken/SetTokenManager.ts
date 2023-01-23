import { Signer } from "@ethersproject/abstract-signer";
import Bluebird from "bluebird";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address } from "packages/utils/src/types";
import BasicIssuanceModuleManager from "./BasicIssuanceModuleManager";
import { Configuration } from "./Configuration";
import SetTokenCreator from "./SetTokenCreator";
import StreamingFeeModuleManager from "./StreamingFeeModuleManager";
import getCreatedSetTokenAddress from "./utils/getCreatedSetTokenAddress";
export class SetTokenManager {
  constructor(
    private configuration: Configuration,
    private hre: HardhatRuntimeEnvironment,
    private signer: Signer
  ) {}

  async createSet({ args }: { args: any }): Promise<string> {
    console.log("creating set ... ");

    const creator = SetTokenCreator({
      hre: this.hre,
      debug: args.debug,
      configuration: this.configuration,
    });
    console.log("creating");
    const receipt = await creator.create(this.signer);

    console.log("getting newly created token set address ...");

    const tokenAddress = await getCreatedSetTokenAddress(receipt);

    console.log("token set address: ", tokenAddress);

    console.log("initializing modules ...");
    await this.initializeModules(tokenAddress);
    console.log("Done! Created token set:", tokenAddress);
    return tokenAddress;
  }

  async initializeModules(setToken: Address): Promise<void> {
    await Bluebird.map(
      Object.keys(this.configuration.core.modules),
      async (moduleName) => {
        switch (moduleName) {
          case "BasicIssuanceModule":
            await new BasicIssuanceModuleManager(
              this.configuration,
              this.signer
            ).initialize(setToken);
            break;
          case "StreamingFeeModule":
            await new StreamingFeeModuleManager(
              this.configuration,
              this.signer
            ).initialize(setToken);
            break;
        }
      },
      { concurrency: 1 }
    );
  }
}
export default SetTokenManager;
