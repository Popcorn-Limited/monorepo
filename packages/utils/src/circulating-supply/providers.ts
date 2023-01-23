import { JsonRpcProvider } from "@ethersproject/providers";
require("../envLoader");

const { ALCHEMY_API_KEYS, BNB_RPC_URLS } = process.env;

const config = {
  ethereum_base_url: "https://eth-mainnet.alchemyapi.io/v2/",
  polygon_base_url: "https://polygon-mainnet.g.alchemy.com/v2/",
  arbitrum_base_url: "https://arb-mainnet.g.alchemy.com/v2/",
  bnb_base_url: "https://withered-wild-feather.bsc.quiknode.pro/",
  optimism_base_url: "https://opt-mainnet.g.alchemy.com/v2/",
  bnb_rpc_urls: BNB_RPC_URLS?.split(","),
};

export const PROVIDERS = {
  ethereum: ALCHEMY_API_KEYS.split(",").map((key) => new JsonRpcProvider(config.ethereum_base_url + key)),
  polygon: ALCHEMY_API_KEYS.split(",").map((key) => new JsonRpcProvider(config.polygon_base_url + key)),
  arbitrum: ALCHEMY_API_KEYS.split(",").map((key) => new JsonRpcProvider(config.arbitrum_base_url + key)),
  bnb: BNB_RPC_URLS.split(",").map((url) => new JsonRpcProvider(url)),
  optimism: ALCHEMY_API_KEYS.split(",").map((key) => new JsonRpcProvider(config.optimism_base_url + key)),
};
