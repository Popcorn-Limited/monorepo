import { BigNumberish } from "@setprotocol/set-protocol-v2/node_modules/ethers";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { getNamedAccountsByChainId } from "../../utils/getNamedAccounts";
import { ZERO } from "./utils/constants";

const {
  yFrax,
  crvFraxMetapool,
  yRai,
  crvRaiMetapool,
  yMusd,
  crvMusdMetapool,
  yAlusd,
  crvAlusdMetapool,
  setTokenCreator,
  setBasicIssuanceModule,
  setStreamingFeeModule,
  daoTreasury,
  daoAgentV2,
} = getNamedAccountsByChainId(1);

export interface Configuration {
  targetNAV: BigNumber;
  manager?: string;
  tokenName: string;
  tokenSymbol: string;
  core: {
    SetTokenCreator: {
      address: string;
    };
    modules: {
      BasicIssuanceModule?: {
        address: string;
        config?: {
          preIssueHook?: string;
        };
      };
      StreamingFeeModule: {
        address: string;
        config?: {
          feeRecipient: string;
          maxStreamingFeePercentage: BigNumberish;
          streamingFeePercentage: BigNumberish;
          lastStreamingFeeTimestamp: BigNumberish;
        };
      };
    };
  };
  components: {
    [key: string]: {
      ratio: number; // percent of targetNAV (out of 100)
      address: string;
      oracle: string;
      amount?: BigNumber; // amount of tokens in set
    };
  };
}

export const DefaultConfiguration: Configuration = {
  targetNAV: parseEther("10000"),
  manager: daoAgentV2,
  tokenName: "Butter V2",
  tokenSymbol: "BTR",
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
          feeRecipient: daoTreasury,
          maxStreamingFeePercentage: parseEther(".05") as BigNumberish,
          streamingFeePercentage: parseEther(".005") as BigNumberish,
          lastStreamingFeeTimestamp: ZERO as BigNumberish,
        },
      },
    },
  },
  components: {
    ycrvFRAX: {
      ratio: 25,
      address: yFrax,
      oracle: crvFraxMetapool,
    },
    ycrvRai: {
      ratio: 25,
      address: yRai,
      oracle: crvRaiMetapool,
    },
    ycrvMusd: {
      ratio: 25,
      address: yMusd,
      oracle: crvMusdMetapool,
    },
    ycrvAlusd: {
      ratio: 25,
      address: yAlusd,
      oracle: crvAlusdMetapool,
    },
  },
};
