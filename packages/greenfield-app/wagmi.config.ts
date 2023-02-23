import { defineConfig } from "@wagmi/cli";
import { etherscan, foundry, react } from "@wagmi/cli/plugins";
import { erc20ABI } from "wagmi";



/*
This is the config file that is used to generate the wagmi hooks.


It can generate hooks using 3 different methods
  1) Foundry (We use some exclusions as there can't be duplicate contracts with the same names - we also use the prefix FoundryHook for the hooks generated from the foundry contracts )
  2) Etherscan (using the contract addresses to look up the ABIs for verified contracts) - Note that these can only be used on the chainId that you created the hooks for
  3) using ABI files

There are some examples in greenfield-app/components/WagmiHookExamples.tsx

HOW TO CREATE THE HOOKS

1. go into the greenfield-app directory --> cd greenfield-app
2. install forge on the terminal by doing following two commands
    - source /Users/your_personal_path/.bashrc
    - foundryup
3. Finally, run `yarn create-hooks`

*/

interface Contracts4Etherscan {
  name: string;
  address: string;
}

const mainnetContracts: Contracts4Etherscan[] = [
  {
    name: "butter",
    address: "0x109d2034e97eC88f50BEeBC778b5A5650F98c124",
  },
  {
    name: "butterBatch",
    address: "0xCd979A9219DB9A353e29981042A509f2E7074D8B",
  },
  {
    name: "butterBatchZapper",
    address: "0x709bC6256413D55a81d6f2063CF057519aE8a95b",
  },
  {
    name: "butterStaking",
    address: "0x27A9B8065Af3A678CD121A435BEA9253C53Ab428",
  },
  {
    name: "butterWhaleProcessing",
    address: "0x8CAF59fd4eF677Bf5c28ae2a6E5eEfA85096Af39",
  },
  {
    name: "pop",
    address: "0xd0cd466b34a24fcb2f87676278af2005ca8a78c4",
  },
  {
    name: "daoAgent",
    address: "0x0ec6290abb4714ba5f1371647894ce53c6dd673a",
  },
  {
    name: "daoAgentV2",
    address: "0x6B1741143D3F2C4f1EdA12e19e9518489DF03e04",
  },
  {
    name: "daoTreasury",
    address: "0x0ec6290abb4714ba5f1371647894ce53c6dd673a",
  },
  {
    name: "popStaking",
    address: "0xeEE1d31297B042820349B03027aB3b13a9406184",
  },
  {
    name: "threeX",
    address: "0x8b97ADE5843c9BE7a1e8c95F32EC192E31A46cf3",
  },
  {
    name: "threeXBatch",
    address: "0x42189f909e1EFA409A4509070dDBc31A592422A8",
  },
  {
    name: "threeXZapper",
    address: "0x6DB9Bb0c672E93515acd1514eafc61e3FC6eDd84",
  },
  {
    name: "threeXBatchVault",
    address: "0x0B4E13D8019D0F762377570000D9C923f0dad82B",
  },
  {
    name: "threeXStaking",
    address: "0x584732f867a4533BC349d438Fba4fc2aEE5f5f83",
  },
  {
    name: "aclRegistry",
    address: "0x8A41aAa4B467ea545DDDc5759cE3D35984F093f4",
  },
  {
    name: "keeperIncentive",
    address: "0xaFacA2Ad8dAd766BCc274Bf16039088a7EA493bF",
  },
  {
    name: "contractRegistry",
    address: "0x85831b53AFb86889c20aF38e654d871D8b0B7eC3",
  },
];

export default defineConfig({
  out: "generated.ts",
  contracts: [
    {
      name: "erc20",
      abi: erc20ABI,
    },
  ],
  plugins: [
    etherscan({
      apiKey: "Z57KPGIPH2G3KH2BR95HEUD89WJGN3EAJU" || process.env.ETHERSCAN_API_KEY,
      chainId: 1,
      contracts: mainnetContracts as any,
    }),
    foundry({
      namePrefix: "FoundryHook",
      exclude: [
        "**/IWETH.sol",
        "out/**",
        "forge-std/**",
        "solmate/**",
        "**IER**/**",
        "**Upgradeable**/**",
        "**Initializable**/**",
        "**IAav**/**",
        "IYearn.sol",
        "ILido.sol"
      ],
      project: "../foundry",
    }),
    react(),
  ],
});