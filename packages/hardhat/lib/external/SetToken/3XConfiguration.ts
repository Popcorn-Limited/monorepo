import { BigNumberish } from "@setprotocol/set-protocol-v2/node_modules/ethers";
import { parseEther } from "ethers/lib/utils";
import { getNamedAccountsByChainId } from "../../utils/getNamedAccounts";
import { Configuration } from "./Configuration";
import { ZERO } from "./utils/constants";

const { ySusd, y3Eur, crvSusd, crv3Eur, setTokenCreator, setBasicIssuanceModule, setStreamingFeeModule, daoAgentV2 } =
  getNamedAccountsByChainId(1);

export const DefaultConfiguration: Configuration = {
  targetNAV: parseEther("10000"),
  manager: daoAgentV2,
  tokenName: "3X",
  tokenSymbol: "3X",
  core: {
    SetTokenCreator: {
      address: setTokenCreator,
    },
    modules: {
      BasicIssuanceModule: {
        address: setBasicIssuanceModule,
      },
      StreamingFeeModule: {
        address: setStreamingFeeModule,
        config: {
          feeRecipient: daoAgentV2,
          maxStreamingFeePercentage: parseEther(".05") as BigNumberish,
          streamingFeePercentage: parseEther(".005") as BigNumberish,
          lastStreamingFeeTimestamp: ZERO as BigNumberish,
        },
      },
    },
  },
  components: {
    ycrvD3: {
      ratio: 50,
      address: ySusd,
      oracle: crvSusd,
      amount: parseEther("4341.536774"),
    },
    ycrvEur3: {
      ratio: 50,
      address: y3Eur,
      oracle: crv3Eur,
      amount: parseEther("4510.311525"),
    },
  },
};
