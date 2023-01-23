import { Signer } from "@ethersproject/abstract-signer";
import { Address } from "@popcorn/utils/src/types";
import {
  BasicIssuanceModule,
  BasicIssuanceModule__factory,
} from "@setprotocol/set-protocol-v2/dist/typechain";
import { Configuration } from "./Configuration";
import { ADDRESS_ZERO } from "./utils/constants";

export default class BasicIssuanceModuleManager {
  private contract: BasicIssuanceModule;

  constructor(private configuration: Configuration, private signer: Signer) {
    this.contract = BasicIssuanceModule__factory.connect(
      this.configuration.core.modules.BasicIssuanceModule.address,
      this.signer
    );
  }

  async initialize(setToken: Address, preIssueHook = ADDRESS_ZERO) {
    console.log("initializing BasicIssuanceModule", { setToken, preIssueHook });
    return this.contract.initialize(setToken, preIssueHook);
  }
}

export { BasicIssuanceModuleManager };
