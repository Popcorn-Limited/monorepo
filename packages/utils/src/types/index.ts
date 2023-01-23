import { BigNumber, Contract } from "ethers";
import { ChainId } from "@popcorn/utils";

export type Address = string;

export interface ContractAddresses {
  xen?: Address;
  staking?: Array<Address>;
  sweetVaults?: Array<Address>;
  defaultTokenList?: Array<Address>;
  popStaking?: Address;
  butterStaking?: Address;
  threeXStaking?: Address;
  popUsdcLpStaking?: Address;
  xenStaking?: Address;
  pop?: Address;
  xPop?: Address;
  xPopRedemption?: Address;
  dai?: Address;
  usdc?: Address;
  usdt?: Address;
  threeCrv?: Address;
  eth?: Address;
  wbtc?: Address;
  crvSEth?: Address;
  sEthSweetVault?: Address;
  sEthSweetVaultStaking?: Address;
  threePool?: Address;
  popUsdcLp?: Address;
  popUsdcUniV3Pool?: Address;
  popUsdcArrakisVault?: Address;
  popUsdcArrakisVaultStaking?: Address;
  butter?: Address;
  butterBatch?: Address;
  butterBatchZapper?: Address;
  butterWhaleProcessing?: Address;
  threeX?: Address;
  threeXBatch?: Address;
  threeXWhale?: Address;
  threeXBatchVault?: Address;
  threeXZapper?: Address;
  yMim?: Address;
  crvMim?: Address;
  crvMimMetapool?: Address;
  yFrax?: Address;
  yRai?: Address;
  yMusd?: Address;
  yAlusd?: Address;
  yEUR?: Address;
  yGBP?: Address;
  yCHF?: Address;
  yJPY?: Address;
  ySusd?: Address;
  y3Eur?: Address;
  crvFrax?: Address;
  crvRai?: Address;
  crvMusd?: Address;
  crvAlusd?: Address;
  crvSusd?: Address;
  crvEUR?: Address;
  crvGBP?: Address;
  crvCHF?: Address;
  crvJPY?: Address;
  crvFraxMetapool?: Address;
  crvRaiMetapool?: Address;
  crvMusdMetapool?: Address;
  crvAlusdMetapool?: Address;
  crvSusdMetapool?: Address;
  crvSusdUtilityPool?: Address;
  ibEUR?: Address;
  ibGBP?: Address;
  ibCHF?: Address;
  ibJPY?: Address;
  sEUR?: Address;
  sGBP?: Address;
  sCHF?: Address;
  sJPY?: Address;
  sUSD?: Address;
  sEth?: Address;
  vaultsV1Zapper?: Address;
  agEur?: Address;
  angleRouter?: Address;
  eurOracle?: Address;
  curveAddressProvider?: Address;
  curveFactoryMetapoolDepositZap?: Address;
  setBasicIssuanceModule?: Address;
  setTokenCreator?: Address;
  setStreamingFeeModule?: Address;
  aclRegistry?: Address;
  contractRegistry?: Address;
  beneficiaryRegistry?: Address;
  beneficiaryGovernance?: Address;
  grantElections?: Address;
  rewardsManager?: Address;
  uniswapRouter?: Address;
  govStaking?: Address;
  // dao: DAO;
  voting?: Address;
  dao?: Address;
  daoAgent?: Address;
  daoTreasury?: Address;
  tokenManager?: Address;
  // other protocols
  balancerVault?: Address;
  balancerLBPFactory?: Address;
  merkleOrchard?: Address;
  rewardsEscrow?: Address;
  vaultsRewardsEscrow?: Address;
  all: Set<Address>;
  has: (contract: string) => boolean;
}

export interface DAO {
  voting?: Address;
  dao?: Address;
  daoAgent?: Address;
  daoTreasury?: Address;
  tokenManager?: Address;
}

export interface ButterDependencyAddresses {
  yFrax?: Address;
  yMim?: Address;
  crvFrax?: Address;
  crvMim?: Address;
  crvFraxMetapool?: Address;
  crvMimMetapool?: Address;
  threePool?: Address;
  curveAddressProvider?: Address;
  curveFactoryMetapoolDepositZap?: Address;
  uniswapRouter?: Address;
  setBasicIssuanceModule?: Address;
  setTokenCreator?: Address;
  setStreamingFeeModule?: Address;
}

export interface VestingRecord {
  unlockDate: string;
  vested: number;
  claimable: number;
}

export type LockedBalance = {
  amount: BigNumber;
  boosted: BigNumber;
  unlockTime: number;
};

export type Token = {
  contract: Contract;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance?: BigNumber;
  allowance?: BigNumber;
  description?: string;
  icon?: string;
  claimableBalance?: BigNumber;
  price?: BigNumber;
  [key: string]: any;
};

export type ERC20Metadata = {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  balance?: BigNumber;
  allowance?: BigNumber;
  description?: string;
  icon?: string;
};

export type ContractMetadata = {
  name?: string;
  symbol?: string;
  description?: string;
  icon?: string;
  platform?: string;
};

export type SweetVaultMetadata = ERC20Metadata & {
  deposited: BigNumber;
  pricePerShare: BigNumber;
  tvl: BigNumber;
  apy: number;
  underlyingToken: Token;
  curveLink: string;
  strategy: string;
  description?: string;
  token: string;
  link: string;
  displayText?: {
    token?: string;
    strategy?: string;
  };
  defaultDepositTokenSymbol?: string;
  stakingAdress?: string;
};

// contract w/ metadata pattern
// TODO we need to find a way to get this type from /foundry or use smth else instead
export type SweetVaultWithMetadata = {
  contract: Contract;
  address: string;
  chainId: ChainId;
  metadata: SweetVaultMetadata;
};

export type StakingPool = {
  address: string;
  tokenAddress: string;
  apy: BigNumber;
  totalStake: BigNumber;
  userStake: BigNumber;
  tokenEmission: BigNumber;
  earned?: BigNumber;
  withdrawable?: BigNumber;
  lockedBalances?: LockedBalance[];
  stakingToken: Token;
};

export type ToastConfig = {
  successMessage: string;
  errorMessage?: string;
  id: string;
};

export type HotSwapParameter = {
  batchIds: string[];
  amounts: BigNumber[];
};

export type SelectedToken = {
  input: Token;
  output: Token;
};

export type ButterTokenKey = "butter" | "threeCrv" | "dai" | "usdc" | "usdt";

export type BatchProcessTokenKey = ButterTokenKey | ThreeXTokenKey;

export type BatchMetadata = {
  accountBatches: AccountBatch[];
  currentBatches: CurrentBatches;
  totalSupply: BigNumber;
  claimableMintBatches: AccountBatch[];
  claimableRedeemBatches: AccountBatch[];
  tokens: Token[];
};

export type ThreeXTokenKey = "threeX" | "dai" | "usdc" | "usdt" | "susd";

export enum BatchType {
  Mint,
  Redeem,
}

export interface CurrentBatches {
  mint: Batch;
  redeem: Batch;
}

export interface TimeTillBatchProcessing {
  timeTillProcessing: Date;
  progressPercentage: number;
}
export interface Batch {
  batchType: BatchType;
  batchId: string;
  claimable: boolean;
  unclaimedShares: BigNumber;
  suppliedTokenBalance: BigNumber;
  claimableTokenBalance: BigNumber;
  suppliedTokenAddress: string;
  claimableTokenAddress: string;
}

export interface AccountBatch extends Batch {
  accountSuppliedTokenBalance: BigNumber;
  accountClaimableTokenBalance: BigNumber;
}

export interface ComponentMap {
  // key is yTokenAddress
  [key: string]: {
    metaPool?: Contract;
    yPool?: Contract;
  };
}
