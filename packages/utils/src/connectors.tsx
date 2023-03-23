import { ethers } from "ethers";

export enum ChainId {
  Ethereum = 1,
  Goerli = 5,
  Arbitrum = 42161,
  Mumbai = 80001,
  Polygon = 137,
  Hardhat = 1337,
  Localhost = 1337,
  BNB = 56,
  RemoteFork = 31338,
  Optimism = 10,
  Fantom = 250,
  ALL = 0,
}

export enum named {
  all = "-1",
  eth = "1",
  goerly = "5",
  arb = "42161",
  mumbai = "80001",
  poly = "137",
  hardhat = "1337",
  localhost = "1337",
  bnb = "56",
  remotefork = "31338",
  op = "10",
  fantom = "250",
  ALL = 0,
}

export enum ChainIdHex {
  Ethereum = "0x1",
  Goerli = "0x5",
  Arbitrum = "0xa4b1",
  Mumbai = "0x13881",
  Polygon = "0x89",
  Localhost = "0x7a69",
  Hardhat = "0x539",
  BNB = "0x38",
  Optimism = "0xa",
  Fantom = "0xfa"
}

export const HexToChain = {
  "0x1": ChainId.Ethereum,
  "0x5": ChainId.Goerli,
  "0xa4b1": ChainId.Arbitrum,
  "0x13881": ChainId.Mumbai,
  "0x89": ChainId.Polygon,
  "0x7a69": ChainId.Localhost,
  "0x539": ChainId.Hardhat,
  "0x38": ChainId.BNB,
  "0xa": ChainId.Optimism,
  "0xfa": ChainId.Fantom
};

export const supportedChainIds = [
  ChainId.Ethereum,
  ChainId.Goerli,
  ChainId.Arbitrum,
  ChainId.Polygon,
  ChainId.Mumbai,
  ChainId.Localhost,
  ChainId.BNB,
  ChainId.Hardhat,
  ChainId.RemoteFork,
  ChainId.Optimism,
  ChainId.Fantom,
  ChainId.ALL,
];

export const networkMap = {
  [ChainId.Ethereum]: "Ethereum",
  [ChainId.Goerli]: "Goerli",
  [ChainId.Arbitrum]: "Arbitrum",
  [ChainId.Mumbai]: "polygon_mumbai",
  [ChainId.Polygon]: "Polygon",
  [ChainId.Hardhat]: "Hardhat",
  [ChainId.Localhost]: "Localhost",
  [ChainId.RemoteFork]: "RemoteFork",
  [ChainId.Optimism]: "Optimism",
  [ChainId.BNB]: "BNB",
  [ChainId.Fantom]: "Fantom",
  [ChainId.ALL]: "All Networks",
};

export const networkLogos = {
  [ChainId.ALL]: "/images/icons/allIcon.svg",
  [ChainId.Ethereum]: "/images/icons/ethereum.svg",
  [ChainId.Goerli]: "/images/icons/testNetLogo.png",
  [ChainId.Polygon]: "/images/icons/polygon.svg",
  [ChainId.Arbitrum]: "/images/icons/arbitrum.svg",
  [ChainId.Localhost]: "/images/icons/testNetLogo.png",
  [ChainId.Hardhat]: "/images/icons/testNetLogo.png",
  [ChainId.RemoteFork]: "/images/icons/testNetLogo.png",
  [ChainId.Optimism]: "/images/icons/optimism-op-logo.svg",
  [ChainId.Fantom]: "/images/icons/fantom.png",
  [ChainId.BNB]: "/images/icons/bsc-logo.png",
};
export const RPC_URLS = {
  [ChainId.Ethereum]: `https://eth-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [ChainId.Goerli]: "https://goerli.blockpi.network/v1/rpc/public",
  [ChainId.Arbitrum]: `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [ChainId.Polygon]: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [ChainId.Optimism]: `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [ChainId.BNB]: `https://bsc-dataseed1.binance.org`,
  [ChainId.Fantom]: `https://rpc.fantom.network`,
  [ChainId.Localhost]: `http://localhost:8545`,
  [ChainId.Hardhat]: `http://localhost:8545`,
  [ChainId.RemoteFork]: `http://localhost:8545`,
};
export const PRC_PROVIDERS = {
  [ChainId.Ethereum]: new ethers.providers.JsonRpcProvider(RPC_URLS[ChainId.Ethereum], ChainId.Ethereum),
  [ChainId.Goerli]: new ethers.providers.JsonRpcProvider(RPC_URLS[ChainId.Goerli], ChainId.Goerli),
  [ChainId.Arbitrum]: new ethers.providers.JsonRpcProvider(RPC_URLS[ChainId.Arbitrum], ChainId.Arbitrum),
  [ChainId.Polygon]: new ethers.providers.JsonRpcProvider(RPC_URLS[ChainId.Polygon], ChainId.Polygon),
  [ChainId.Mumbai]: new ethers.providers.JsonRpcProvider(RPC_URLS[ChainId.Mumbai], ChainId.Mumbai),
  [ChainId.BNB]: new ethers.providers.JsonRpcProvider(RPC_URLS[ChainId.BNB], ChainId.BNB),
  [ChainId.Localhost]: new ethers.providers.JsonRpcProvider(RPC_URLS[ChainId.Localhost], ChainId.Localhost),
  [ChainId.Hardhat]: new ethers.providers.JsonRpcProvider(RPC_URLS[ChainId.Hardhat], ChainId.Hardhat),
  [ChainId.RemoteFork]: new ethers.providers.JsonRpcProvider(RPC_URLS[ChainId.RemoteFork], ChainId.RemoteFork),
  [ChainId.Optimism]: new ethers.providers.JsonRpcProvider(RPC_URLS[ChainId.Optimism], ChainId.Optimism),
  [ChainId.Fantom]: new ethers.providers.JsonRpcProvider(RPC_URLS[ChainId.Fantom], ChainId.Fantom),
};

export type HardhatConfigNetworks = {
  mainnet?: string;
  goerli?: string;
  bsc?: string;
  polygon?: string;
  hardhat?: string;
  arbitrum?: string;
  optimism?: string;
  fantom?: string;
  localhost?: string;
  remote_fork?: string;
};

export const HardhatConfigNetworksChainIdMapping = {
  mainnet: ChainId.Ethereum,
  ethereum: ChainId.Ethereum,
  goerli: ChainId.Goerli,
  bsc: ChainId.BNB,
  bnb: ChainId.BNB,
  polygon: ChainId.Polygon,
  hardhat: ChainId.Hardhat,
  localhost: ChainId.Localhost,
  arbitrum: ChainId.Arbitrum,
  fantom: ChainId.Fantom,
  remote_fork: ChainId.RemoteFork,
};
