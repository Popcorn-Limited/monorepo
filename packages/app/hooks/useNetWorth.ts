import { ChainId } from "@popcorn/utils";
import { BigNumber, constants } from "ethers/lib/ethers";
import { useCallback, useMemo } from "react";
import useButterBatchData from "@popcorn/app/hooks/set/useButterBatchData";
import useThreeXData from "@popcorn/app/hooks/set/useThreeXData";
import usePopLocker from "@popcorn/app/hooks/staking/usePopLocker";
import useStakingPool from "@popcorn/app/hooks/staking/useStakingPool";
import useTokenBalance from "@popcorn/app/hooks/tokens/useTokenBalance";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import { useGetUserEscrows } from "@popcorn/app/hooks/useGetUserEscrows";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import useTokenPrices from "./tokens/useTokenPrices";

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
  const { account } = useWeb3();
  const { Ethereum, Polygon, BNB, Arbitrum } = ChainId;
  const useHoldingValue = useCallback(getHoldingValue, []);

  const ethereum = useDeployment(Ethereum);
  const polygon = useDeployment(Polygon);
  const bnb = useDeployment(BNB);
  const arbitrum = useDeployment(Arbitrum);

  const { data: mainnetPriceData } = useTokenPrices([ethereum.pop, ethereum.popUsdcArrakisVault], Ethereum); // in 1e18
  const popPrice = mainnetPriceData?.[ethereum.pop];
  const mainnetLpPrice = mainnetPriceData?.[ethereum.popUsdcArrakisVault];

  const { data: poylgonLpPriceData } = useTokenPrices([polygon.pop, polygon.popUsdcArrakisVault], Polygon); // in 1e18
  const polygonLpPrice = poylgonLpPriceData?.[polygon.popUsdcArrakisVault];

  const { data: mainnetPopStaking } = usePopLocker(ethereum.popStaking, Ethereum);
  const { data: polygonPopStaking } = usePopLocker(polygon.popStaking, Polygon);
  const { data: butterStakingPool } = useStakingPool(ethereum.butterStaking, Ethereum);
  const { data: butterBatchData } = useButterBatchData(Ethereum);
  const { data: threeXStakingPool } = useStakingPool(ethereum.threeXStaking, Ethereum);
  const { data: threeXBatchData } = useThreeXData(Ethereum);
  const { data: polygonPopBalance } = useTokenBalance(polygon?.pop, account, Polygon);
  const { data: mainnetPopBalance } = useTokenBalance(ethereum?.pop, account, Ethereum);
  const { data: bnbPopBalance } = useTokenBalance(bnb.pop, account, BNB);
  const { data: arbitrumPopBalance } = useTokenBalance(arbitrum.pop, account, Arbitrum);
  const { data: mainnetEscrow } = useGetUserEscrows(ethereum.rewardsEscrow, account, Ethereum);
  const { data: polygonEscrow } = useGetUserEscrows(polygon.rewardsEscrow, account, Polygon);
  const { data: bnbEscrow } = useGetUserEscrows(bnb.rewardsEscrow, account, BNB);
  const { data: arbitrumEscrow } = useGetUserEscrows(arbitrum.rewardsEscrow, account, Arbitrum);

  const { data: mainnetLpBalance } = useTokenBalance(polygon?.popUsdcArrakisVault, account, Ethereum);
  const { data: polygonLpBalance } = useTokenBalance(ethereum?.popUsdcArrakisVault, account, Polygon);
  const { data: mainnetLpStakingPool } = useStakingPool(ethereum.popUsdcArrakisVaultStaking, Ethereum);
  const { data: polygonLpStakingPool } = useStakingPool(ethereum.popUsdcArrakisVaultStaking, Polygon);
  const mainnetPopLpHoldings = useHoldingValue(mainnetLpBalance, mainnetLpPrice);
  const polygonPopLpHoldings = useHoldingValue(polygonLpBalance, polygonLpPrice);
  const mainnetPopLpStakingHoldings = useHoldingValue(mainnetLpStakingPool?.userStake, mainnetLpPrice);
  const polygonPopLpStakingHoldings = useHoldingValue(polygonLpStakingPool?.userStake, polygonLpPrice);

  const { data: mainnetVaultEscrow } = useGetUserEscrows(ethereum.vaultsRewardsEscrow, account, Ethereum);

  const mainnetPopHoldings = useHoldingValue(mainnetPopBalance, popPrice);
  const polygonPopHoldings = useHoldingValue(polygonPopBalance, popPrice);
  const bnbPopHoldings = useHoldingValue(bnbPopBalance, popPrice);
  const arbitrumPopHoldings = useHoldingValue(arbitrumPopBalance, popPrice);
  const mainnetPopStakingHoldings = useHoldingValue(mainnetPopStaking?.userStake, popPrice);
  const polygonPopStakingHoldings = useHoldingValue(polygonPopStaking?.userStake, popPrice);

  const mainnetPopStakingRewardsHoldings = useHoldingValue(mainnetPopStaking?.earned, popPrice);
  const polygonPopStakingRewardsHoldings = useHoldingValue(polygonPopStaking?.earned, popPrice);
  const butterStakingRewardsHoldings = useHoldingValue(butterStakingPool?.earned, popPrice);
  const threeXStakingRewardsHoldings = useHoldingValue(threeXStakingPool?.earned, popPrice);
  const mainnetLPStakingRewardsHoldings = useHoldingValue(mainnetLpStakingPool?.earned, popPrice);
  const polygonLPStakingRewardsHoldings = useHoldingValue(polygonLpStakingPool?.earned, popPrice);

  const polygonEscrowHoldings = useHoldingValue(
    polygonEscrow?.totalClaimablePop?.add(polygonEscrow?.totalVestingPop),
    popPrice,
  );
  const bnbEscrowHoldings = useHoldingValue(bnbEscrow?.totalClaimablePop?.add(bnbEscrow?.totalVestingPop), popPrice);
  const arbitrumEscrowHoldings = useHoldingValue(
    arbitrumEscrow?.totalClaimablePop?.add(arbitrumEscrow?.totalVestingPop),
    popPrice,
  );
  const mainnetEscrowHoldings = useHoldingValue(
    BigNumber.from("0")
      .add(mainnetEscrow?.totalClaimablePop || "0")
      .add(mainnetEscrow?.totalVestingPop || "0")
      .add(mainnetVaultEscrow?.totalClaimablePop || "0")
      .add(mainnetVaultEscrow?.totalVestingPop || "0"),
    popPrice,
  );

  const butterHoldings = useMemo(() => {
    if (!butterBatchData) return constants.Zero;
    const butter = butterBatchData?.tokens.find((token) => token.address === ethereum.butter);
    return getHoldingValue(butter?.balance?.add(butter?.claimableBalance), butter?.price);
  }, [butterBatchData]);
  const threeXHoldings = useMemo(() => {
    if (!threeXBatchData) return constants.Zero;
    const threeX = threeXBatchData?.tokens.find((token) => token.address === ethereum.threeX);
    return getHoldingValue(threeX?.balance?.add(threeX?.claimableBalance), threeX?.price);
  }, [threeXBatchData]);
  const butterStakingHoldings = useMemo(() => {
    if (!butterStakingPool || !butterBatchData) return constants.Zero;
    const butter = butterBatchData?.tokens.find((token) => token.address === ethereum.butter);
    return getHoldingValue(butterStakingPool?.userStake, butter?.price);
  }, [butterStakingPool, butterBatchData]);
  const threeXStakingHoldings = useMemo(() => {
    if (!threeXStakingPool || !threeXBatchData) return constants.Zero;
    const threeX = threeXBatchData?.tokens.find((token) => token.address === ethereum.threeX);
    return getHoldingValue(threeXStakingPool?.userStake, threeX?.price);
  }, [threeXStakingPool, threeXBatchData]);
  const butterRedeemBatchHoldings = useMemo(() => {
    if (!butterBatchData) return constants.Zero;
    const threeCrv = butterBatchData?.tokens.find((token) => token.address === ethereum.threeCrv);
    return getHoldingValue(threeCrv?.claimableBalance, threeCrv?.price);
  }, [butterBatchData]);
  const threeXRedeemBatchHoldings = useMemo(() => {
    if (!threeXBatchData) return constants.Zero;
    const usdc = threeXBatchData?.tokens.find((token) => token.address === ethereum.usdc);
    return getHoldingValue(usdc?.claimableBalance, usdc?.price);
  }, [threeXBatchData]);

  const calculateEthereumHoldings = (): BigNumber => {
    return [
      mainnetPopHoldings,
      mainnetPopStakingHoldings,
      butterHoldings,
      threeXHoldings,
      butterStakingHoldings,
      threeXStakingHoldings,
      mainnetEscrowHoldings,
      butterRedeemBatchHoldings,
      threeXRedeemBatchHoldings,
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
