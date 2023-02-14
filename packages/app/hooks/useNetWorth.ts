import { ChainId } from "@popcorn/utils";
import { BigNumber, constants } from "ethers/lib/ethers";
import { useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import { useNamedAccounts } from "@popcorn/components/lib/utils";
import usePrice from "@popcorn/components/lib/Price/hooks/usePrice";
import { useBalanceOf } from "@popcorn/components/lib/Erc20/hooks";
import { useClaimableBalance } from "@popcorn/components/lib/PopLocker/hooks/useClaimableBalance";
import { useLockedBalances } from "@popcorn/components/lib/PopLocker/hooks";
import { useClaimableBalance as useClaimableBalanceStaking } from "@popcorn/components/lib/Staking/hooks/useClaimableBalance";
import { useEscrowBalance } from "@popcorn/components/lib/Escrow/hooks/useEscrowBalance";
import { useButterHoldings } from "@popcorn/components/lib/Butter/hooks/useButterHoldings";
import { useButterRedeemHoldings } from "@popcorn/components/lib/Butter/hooks/useButterRedeemHoldings";
import { useThreeXHoldings } from "@popcorn/components/lib/3X/hooks/useThreeXHoldings";
import { useThreeXRedeemHoldings } from "@popcorn/components/lib/3X/hooks";

function getHoldingValue(tokenAmount: BigNumber, tokenPrice: BigNumber): BigNumber {
  tokenAmount = tokenAmount?.gt(constants.Zero) ? tokenAmount : constants.Zero;
  return tokenAmount.eq(constants.Zero) || tokenPrice?.eq(constants.Zero)
    ? constants.Zero
    : tokenAmount?.mul(tokenPrice ? tokenPrice : constants.Zero).div(constants.WeiPerEther) || constants.Zero;
}

export default function useNetWorth(): {
  Ethereum: BigNumber;
  Polygon: BigNumber;
  BNB: BigNumber;
  Arbitrum: BigNumber;
  totalNetWorth: BigNumber;
} {
  const { address: account } = useAccount();
  const { Ethereum, Polygon, BNB, Arbitrum } = ChainId;
  const useHoldingValue = useCallback(getHoldingValue, []);

  const ethereum = useNamedAccounts("1", [
    "pop",
    "popUsdcArrakisVault",
    "popStaking",
    "rewardsEscrow",
    "butterStaking",
    "threeXStaking",
    "popUsdcArrakisVaultStaking",
    "butter",
    "threeCrv",
    "threeX",
    "usdc",
    "butterBatch",
  ]);
  const [
    ethereumPop,
    ethereumPopUsdcArrakisVault,
    ethereumPopStaking,
    ethereumRewardsEscrow,
    ethereumButterStaking,
    ethereumThreeXStaking,
    ethereumPopUsdcArrakisVaultStaking,
    ethereumButter,
    ethereumThreeCrv,
    ethereumThreeX,
  ] = ethereum;
  const polygon = useNamedAccounts("137", [
    "pop",
    "popUsdcArrakisVault",
    "popStaking",
    "rewardsEscrow",
    "popUsdcArrakisVaultStaking",
  ]);
  const [
    polygonPop,
    polygonPopUsdcArrakisVault,
    polygonPopStaking,
    polygonRewardsEscrow,
    polygonPopUsdcArrakisVaultStaking,
  ] = polygon;
  const bnb = useNamedAccounts("56", ["pop", "rewardsEscrow"]);
  const [bnbPop, bnbRewardsEscrow] = bnb;
  const arbitrum = useNamedAccounts("42161", ["pop"]);
  const [arbPop, arbRewardsEscrow] = arbitrum;

  const { data: popPrice } = usePrice({ address: ethereumPop?.address, chainId: Ethereum });
  const { data: mainnetLpPrice } = usePrice({ address: ethereumPopUsdcArrakisVault?.address, chainId: Ethereum });
  const { data: polygonLpPrice } = usePrice({ address: polygonPopUsdcArrakisVault?.address, chainId: Polygon });

  const { data: polygonPopBalance } = useBalanceOf({ address: polygonPop.address, chainId: Polygon, account });
  const { data: mainnetPopBalance } = useBalanceOf({ address: ethereumPop.address, chainId: Ethereum, account });
  const { data: bnbPopBalance } = useBalanceOf({ address: bnbPop.address, account, chainId: BNB });
  const { data: arbitrumPopBalance } = useBalanceOf({ address: arbPop.address, account, chainId: Arbitrum });

  const { data: mainnetEscrowClaimablePop } = useClaimableBalance({
    chainId: Ethereum,
    address: ethereumRewardsEscrow?.address,
    account,
  });
  const { data: mainnetEscrowVestingPop } = useEscrowBalance({
    chainId: Ethereum,
    address: ethereumRewardsEscrow?.address,
    account,
  });

  const { data: polygonEscrowClaimablePop } = useClaimableBalance({
    chainId: Polygon,
    address: polygonRewardsEscrow?.address,
    account,
  });
  const { data: polygonEscrowVestingPop } = useEscrowBalance({
    chainId: Polygon,
    address: polygonRewardsEscrow?.address,
    account,
  });

  const { data: bnbEscrowClaimablePop } = useClaimableBalance({
    chainId: BNB,
    address: bnbRewardsEscrow?.address,
    account,
  });
  const { data: bnbEscrowVestingPop } = useEscrowBalance({
    chainId: BNB,
    address: bnbRewardsEscrow?.address,
    account,
  });

  const { data: arbitrumEscrowClaimablePop } = useClaimableBalance({
    chainId: Arbitrum,
    address: arbRewardsEscrow?.address,
    account,
  });
  const { data: arbitrumEscrowVestingPop } = useEscrowBalance({
    chainId: Arbitrum,
    address: arbRewardsEscrow?.address,
    account,
  });

  const { data: mainnetLpBalance } = useBalanceOf({
    address: ethereumPopUsdcArrakisVault?.address,
    account,
    chainId: Ethereum,
  });
  const { data: polygonLpBalance } = useBalanceOf({
    address: polygonPopUsdcArrakisVault?.address,
    account,
    chainId: Polygon,
  });
  const { data: mainnetLpStakingPoolBalance } = useBalanceOf({
    address: ethereumPopUsdcArrakisVaultStaking?.address,
    account,
    chainId: Ethereum,
  });
  const { data: polygonLpStakingPoolBalance } = useBalanceOf({
    address: polygonPopUsdcArrakisVaultStaking?.address,
    account,
    chainId: Polygon,
  });

  const mainnetPopLpHoldings = useHoldingValue(mainnetLpBalance?.value, mainnetLpPrice?.value);
  const polygonPopLpHoldings = useHoldingValue(polygonLpBalance?.value, polygonLpPrice?.value);
  const mainnetPopLpStakingHoldings = useHoldingValue(mainnetLpStakingPoolBalance?.value, mainnetLpPrice?.value); // Are  these variables meant to be the same thing?
  const polygonPopLpStakingHoldings = useHoldingValue(polygonLpStakingPoolBalance?.value, polygonLpPrice?.value);

  const mainnetPopHoldings = useHoldingValue(mainnetPopBalance?.value, popPrice?.value);
  const polygonPopHoldings = useHoldingValue(polygonPopBalance?.value, popPrice?.value);
  const bnbPopHoldings = useHoldingValue(bnbPopBalance?.value, popPrice?.value);
  const arbitrumPopHoldings = useHoldingValue(arbitrumPopBalance?.value, popPrice?.value);

  const { data: ethereumLockedBalances } = useLockedBalances({
    address: ethereumPopStaking?.address,
    chainId: Ethereum,
    account,
  });
  const mainnetPopStakingHoldings = useHoldingValue(ethereumLockedBalances?.locked, popPrice?.value);

  const { data: polygonLockedBalances2 } = useLockedBalances({
    address: polygonPopStaking?.address,
    chainId: Polygon,
    account,
  });
  const polygonPopStakingHoldings = useHoldingValue(polygonLockedBalances2?.locked, popPrice?.value);

  const { data: earnedMainnetPop } = useClaimableBalance({
    address: ethereumPopStaking?.address,
    account,
    chainId: Ethereum,
  });
  const mainnetPopStakingRewardsHoldings = useHoldingValue(earnedMainnetPop?.value, popPrice?.value);

  const { data: earnedPolygonPop } = useClaimableBalance({
    address: polygonPopStaking?.address,
    account,
    chainId: Polygon,
  });
  const polygonPopStakingRewardsHoldings = useHoldingValue(earnedPolygonPop?.value, popPrice?.value);

  const { data: earnedButterStaking } = useClaimableBalance({
    address: ethereumButterStaking?.address,
    account,
    chainId: Ethereum,
  });
  const butterStakingRewardsHoldings = useHoldingValue(earnedButterStaking?.value, popPrice?.value);

  const { data: earnedThreeX } = useClaimableBalance({
    address: ethereumThreeXStaking?.address,
    account,
    chainId: Ethereum,
  });
  const threeXStakingRewardsHoldings = useHoldingValue(earnedThreeX?.value, popPrice?.value);

  const { data: earnedEthereumPopUsdcStaking } = useClaimableBalance({
    address: ethereumPopUsdcArrakisVault?.address,
    account,
    chainId: Ethereum,
  });
  const mainnetLPStakingRewardsHoldings = useHoldingValue(earnedEthereumPopUsdcStaking?.value, popPrice?.value);

  const { data: earnedPolygonPopUsdcStaking } = useClaimableBalance({
    address: polygonPopUsdcArrakisVault?.address,
    account,
    chainId: Polygon,
  });
  const polygonLPStakingRewardsHoldings = useHoldingValue(earnedPolygonPopUsdcStaking?.value, popPrice?.value);

  const polygonEscrowHoldings = useHoldingValue(
    polygonEscrowClaimablePop?.value.add(polygonEscrowVestingPop?.value),
    popPrice?.value,
  );
  const bnbEscrowHoldings = useHoldingValue(
    bnbEscrowClaimablePop?.value.add(bnbEscrowVestingPop?.value),
    popPrice?.value,
  );
  const arbitrumEscrowHoldings = useHoldingValue(
    arbitrumEscrowClaimablePop?.value.add(arbitrumEscrowVestingPop?.value),
    popPrice?.value,
  );

  const mainnetEscrowHoldings = useHoldingValue(
    BigNumber.from("0")
      .add(mainnetEscrowClaimablePop?.value || "0")
      .add(mainnetEscrowVestingPop?.value || "0"),
    popPrice?.value,
  );

  const { data: butterBalance } = useBalanceOf({ address: ethereumButter?.address, account, chainId: Ethereum });
  const { data: butterPrice } = usePrice({ address: ethereumButter?.address, account, chainId: Ethereum });
  const butterHoldings = useHoldingValue(butterBalance?.value, butterPrice?.value);

  const { data: butterStaking } = useBalanceOf({
    address: ethereumButterStaking?.address,
    account,
    chainId: Ethereum,
  });
  const butterStakingHoldings = useHoldingValue(butterStaking?.value, butterPrice?.value);

  const { data: threeXBalance } = useBalanceOf({ address: ethereumThreeX?.address, account, chainId: Ethereum });
  const { data: threeXPrice } = usePrice({ address: ethereumThreeX?.address, account, chainId: Ethereum });
  const threeXHoldings = useHoldingValue(threeXBalance?.value, threeXPrice?.value);

  const { data: threeXStaking } = useBalanceOf({
    address: ethereumThreeXStaking?.address,
    account,
    chainId: Ethereum,
  });
  const threeXStakingHoldings = useHoldingValue(threeXStaking?.value, threeXPrice?.value);

  const calculateEthereumHoldings = (): BigNumber => {
    return [
      mainnetPopHoldings,
      mainnetPopStakingHoldings,
      butterHoldings,
      threeXHoldings,
      butterStakingHoldings,
      threeXStakingHoldings,
      mainnetEscrowHoldings,
      mainnetPopStakingRewardsHoldings,
      butterStakingRewardsHoldings,
      threeXStakingRewardsHoldings,
      mainnetLPStakingRewardsHoldings,
      mainnetPopLpHoldings,
      mainnetPopLpStakingHoldings,
    ].reduce((total, num) => total.add(num));
  };

  const calculatePolygonHoldings = (): BigNumber => {
    return [
      polygonPopHoldings,
      polygonPopStakingHoldings,
      polygonEscrowHoldings,
      polygonPopStakingRewardsHoldings,
      polygonLPStakingRewardsHoldings,
      polygonPopLpHoldings,
      polygonPopLpStakingHoldings,
    ].reduce((total, num) => total.add(num));
  };

  const calculateArbitrumHoldings = (): BigNumber => {
    return [arbitrumPopHoldings, arbitrumEscrowHoldings].reduce((total, num) => total.add(num));
  };

  const calculateBnbHoldings = (): BigNumber => {
    return [bnbPopHoldings, bnbEscrowHoldings].reduce((total, num) => total.add(num));
  };

  const calculateTotalHoldings = () => {
    return [
      calculateEthereumHoldings(),
      calculatePolygonHoldings(),
      calculateBnbHoldings(),
      calculateArbitrumHoldings(),
    ].reduce((total, num) => total.add(num));
  };

  return {
    Ethereum: calculateEthereumHoldings(),
    Polygon: calculatePolygonHoldings(),
    BNB: calculateBnbHoldings(),
    Arbitrum: calculateArbitrumHoldings(),
    totalNetWorth: calculateTotalHoldings(),
  };
}
