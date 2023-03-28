import { BigNumber, constants, Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { resolve_price } from "../../price-resolvers/resolve_price";

export async function multiRewardStaking(address, chainId, rpc?): Promise<{ value: BigNumber; decimals: number }> {
  chainId = Number(chainId);
  const multiRewardStaking = new Contract(
    address,
    multiStakingAbi,
    rpc,
  );

  const [vaultAddress, rewardTokens, stakedTotalSupply] = await Promise.all([
    multiRewardStaking.asset(),
    multiRewardStaking.getAllRewardsTokens(),
    multiRewardStaking.totalSupply(),
  ]);

  const vault = new Contract(
    vaultAddress,
    multiStakingAbi,
    rpc,
  );

  const [asset, totalAssets] = await Promise.all([
    vault.asset(),
    vault.totalAssets(),
  ]);
  const assetPrice = await resolve_price({ address: asset, chainId, rpc })
  const totalSupplyValue = parseUnits(String((
    (Number(assetPrice?.value?.toString()) * Number(totalAssets?.toString())) /
    (10 ** (assetPrice?.decimals * 2))))
  )

  const rewardsTokenPrices = await Promise.all(rewardTokens.map(token => resolve_price({ address: token, chainId, rpc })))
  const rewardInfos = await Promise.all(rewardTokens.map(token => multiRewardStaking.rewardInfos(token)))

  const rewardsPerSecond = rewardsTokenPrices.map((price, i) => rewardInfos[i].rewardsPerSecond
    .mul(price.value)
    .div(parseUnits("1", price.decimals)))
  const rewardsValuePerSecond = rewardsPerSecond.reduce((total, num) => total.add(num), constants.Zero)
  const rewardsValuePerYear = BigNumber.from(365 * 24 * 60 * 60).mul(rewardsValuePerSecond);

  const apy = rewardsValuePerYear.mul(parseUnits("1")).div(totalSupplyValue);
  return { value: apy, decimals: 18 };
}


const multiStakingAbi = [
  {
    inputs: [
      {
        internalType: "contract IERC20Upgradeable",
        name: "",
        type: "address"
      }
    ],
    name: "rewardInfos",
    outputs: [
      {
        internalType: "uint64",
        name: "ONE",
        type: "uint64"
      },
      {
        internalType: "uint160",
        name: "rewardsPerSecond",
        type: "uint160"
      },
      {
        internalType: "uint32",
        name: "rewardsEndTimestamp",
        type: "uint32"
      },
      {
        internalType: "uint224",
        name: "index",
        type: "uint224"
      },
      {
        internalType: "uint32",
        name: "lastUpdatedTimestamp",
        type: "uint32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getAllRewardsTokens",
    outputs: [
      {
        internalType: "contract IERC20Upgradeable[]",
        name: "",
        type: "address[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "asset",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalAssets",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
]