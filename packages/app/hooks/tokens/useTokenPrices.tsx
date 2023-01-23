import { Provider } from "@ethersproject/providers";
import { ERC20__factory, IBasicIssuanceModule } from "@popcorn/hardhat/typechain";
import { ChainId } from "@popcorn/utils";
import { BigNumber, constants, Contract } from "ethers/lib/ethers";
import { parseEther } from "ethers/lib/utils";
import getAssetValue from "@popcorn/app/helper/getAssetValue";
import useBasicIssuanceModule from "@popcorn/app/hooks/set/useBasicIssuanceModule";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import { useRpcProvider } from "@popcorn/app/hooks/useRpcProvider";
import useSWR from "swr";
import useLPTokenAddresses from "@popcorn/app/hooks/tokens/useLPTokenAddresses";
import useSetTokenAddresses from "@popcorn/app/hooks/tokens/useSetTokenAddresses";
import useSweetVaultAddresses from "@popcorn/app/hooks/tokens/useSweetVaultAddresses";

// async function getVaultTokenPrice(address: string, provider: Provider, chainId: ChainId): Promise<BigNumber> {
//   const vault = Vault__factory.connect(address, provider);
//   const pricePerShare = await vault.pricePerShare();
//   const underlying = await vault.asset();
//   return pricePerShare.mul(getAssetValue([underlying], chainId)[underlying]).div(parseEther("1"));
// }

async function getPool2UnderlyingAmounts(
  address: string,
  pop: string,
  usdc: string,
  provider: Provider,
): Promise<[BigNumber, BigNumber]> {
  const usdcAmount = await ERC20__factory.connect(usdc, provider).balanceOf(address);
  const popAmount = await ERC20__factory.connect(pop, provider).balanceOf(address);
  return [usdcAmount, popAmount];
}

async function getArrakisUnderlyingAmounts(
  address: string,
  pop: string,
  usdc: string,
  provider: Provider,
): Promise<[BigNumber, BigNumber]> {
  const arrakisVault = new Contract(
    address,
    ["function getUnderlyingBalances() view returns (uint256, uint256)"],
    provider,
  );
  return arrakisVault.getUnderlyingBalances();
}

async function getLPTokenPrice(
  address: string,
  pop: string,
  usdc: string,
  popUsdcArrakisVault: string,
  provider: Provider,
  chainId: ChainId,
): Promise<BigNumber> {
  const assets = await getAssetValue([pop, usdc], chainId);
  const lpTokenAmount = await ERC20__factory.connect(address, provider).totalSupply();

  const [usdcAmount, popAmount] =
    address.toLowerCase() === popUsdcArrakisVault.toLowerCase()
      ? await getArrakisUnderlyingAmounts(address, pop, usdc, provider)
      : await getPool2UnderlyingAmounts(address, pop, usdc, provider);

  // rause usdcAmount to 1e18
  const usdcValue = usdcAmount.mul(1e12).mul(assets[usdc]).div(parseEther("1"));
  const popValue = popAmount.mul(assets[pop]).div(parseEther("1"));

  const totalValue = usdcValue.add(popValue);
  return totalValue.mul(parseEther("1")).div(lpTokenAmount);
}

async function getSetTokenPrice(
  address: string,
  chainId: ChainId,
  basicIssuanceModule: IBasicIssuanceModule,
): Promise<BigNumber> {
  const [addresses, quantities] = await basicIssuanceModule.getRequiredComponentUnitsForIssue(address, parseEther("1"));
  const values = await getAssetValue(addresses, chainId);
  return addresses
    .map((entry, i) => quantities[i].mul(values[entry]).div(parseEther("1")))
    .reduce((sum, cur) => sum.add(cur), constants.Zero);
}

export default function useTokenPrices(addresses: string[], chainId: ChainId) {
  addresses = addresses?.map((address) => address?.toLowerCase());

  const { pop, usdc, popUsdcArrakisVault, setBasicIssuanceModule } = useDeployment(chainId);
  const provider = useRpcProvider(chainId);
  const vaults = Object.values(useSweetVaultAddresses(chainId));
  const setToken = Object.values(useSetTokenAddresses(chainId));
  const lpToken = Object.values(useLPTokenAddresses(chainId));
  const basicIssuanceModule = useBasicIssuanceModule(setBasicIssuanceModule, chainId);
  const shouldFetch =
    !!provider &&
    lpToken.length > 0 &&
    (chainId === ChainId.Ethereum ? vaults.length > 0 && setToken.length > 0 && basicIssuanceModule : true);
  const isInternalToken = (address: string) => [...vaults, ...setToken, ...lpToken].includes(address);

  async function fetchPrices(tokenAdresses: string[], chain: ChainId): Promise<{ [x: string]: BigNumber }> {
    const internalToken =
      tokenAdresses.filter((address) => isInternalToken(address)).length > 0
        ? await tokenAdresses
            .filter((address) => isInternalToken(address))
            .map(async (address) => {
              if (vaults.includes(address)) {
                return { [address]: constants.Zero }; //await getVaultTokenPrice(address, provider, chain) };
              } else if (setToken.includes(address)) {
                return { [address]: await getSetTokenPrice(address, chain, basicIssuanceModule) };
              } else if (lpToken.includes(address)) {
                return { [address]: await getLPTokenPrice(address, pop, usdc, popUsdcArrakisVault, provider, chain) };
              }
            })
            .reduce((accumulated, current) => ({ ...accumulated, ...current }))
        : {};

    const externalTokens =
      tokenAdresses.filter((address) => !isInternalToken(address)).length > 0
        ? await getAssetValue(
            tokenAdresses.filter((address) => !isInternalToken(address)),
            chain,
          )
        : {};
    return { ...internalToken, ...externalTokens };
  }

  return useSWR(
    shouldFetch ? ["assetValue", addresses, chainId] : null,
    ([_, addresses, chainId]) => fetchPrices(addresses, chainId),
    {
      refreshInterval: 10000,
    },
  );
}
