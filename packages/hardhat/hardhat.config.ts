import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@popcorn/utils/src/envLoader";
import "@typechain/hardhat";
import "hardhat-contract-sizer";
import "@anthonymartin/hardhat-deploy";
import "hardhat-gas-reporter";
import "hardhat-secure-signer";
import "./lib/tasks";
import "solidity-coverage";

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
      {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
      {
        version: "0.8.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
      {
        version: "0.7.3",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
      {
        version: "0.6.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
    ],
  },
  networks: {
    mainnet: {
      timeout: 60000,
      chainId: 1,
      url: process.env.RPC_URL || `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    },
    hardhat: {
      allowUnlimitedContractSize: true,
      initialBaseFeePerGas: 0,
      chainId: 1337,
      forking: Boolean(parseInt(process.env.FORKING || "0"))
        ? {
            url: process.env.RPC_URL,
          }
        : undefined,
    },
    localhost: {
      chainId: 1337,
      url: "http://localhost:8545",
    },
    remote_fork: {
      chainId: 31338,
      url: process.env.RPC_URL || `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      gasPrice: 10000000000,
    },
    rinkeby: {
      timeout: 60000,
      url: process.env.RPC_URL || `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      tags: ["rinkeby"],
    },
    kovan: {
      url: process.env.RPC_URL || `https://kovan.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      tags: ["LBP"],
    },
    gorli: {
      url: process.env.RPC_URL || `https://gorli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    },
    polygon: {
      chainId: 137,
      gasPrice: 50,
      timeout: 60000,
      url: process.env.RPC_URL || `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      tags: ["grants"],
    },
    polygontest: {
      url: process.env.RPC_URL || `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    },
    mumbai: {
      url: process.env.RPC_URL || `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    },
    arbitrum: {
      timeout: 60000,
      url: process.env.RPC_URL || `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    },
    bsc: {
      timeout: 60000,
      url: process.env.RPC_URL || "https://undefined",
      chainId: 56,
    },
    rinkarby: {
      url: process.env.RPC_URL || "https://rinkeby.arbitrum.io/rpc",
      // `https://arbitrum-rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    },
    goerli: {
      timeout: 60000,
      url: process.env.RPC_URL || `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      chainId: 5,
      tags: ["grants"],
    },
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 100,
    enabled: false,
  },
  mocha: {
    timeout: 1200000,
  },
  /*contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },*/
};
