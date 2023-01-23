import { ChainId } from "@popcorn/utils";
import { InfoIconWithTooltip } from "@popcorn/app/components/InfoIconWithTooltip";
import { formatUnits } from "ethers/lib/utils";
import useStakingTVL from "@popcorn/app/hooks/staking/useStakingTVL";
import React from "react";
import Product from "@popcorn/app/components/landing/Product";
import useNetworkName from "@popcorn/app/hooks/useNetworkName";
import { useNamedAccounts } from "@popcorn/components/lib/utils/hooks";
import { Staking, Contract } from "@popcorn/components/lib";
import { useFeatures } from "@popcorn/components/hooks/useFeatures";

const Products = () => {
  const { Ethereum, Polygon } = ChainId;
  const networkName = useNetworkName();

  const { data: mainnetStakingTVL } = useStakingTVL(Ethereum);
  const { data: polygonStakingTVL } = useStakingTVL(Polygon);
  const [threeX, butter, threeXStaking, butterStaking] = useNamedAccounts("1", [
    "threeX",
    "butter",
    "threeXStaking",
    "butterStaking",
  ]);
  const {
    features: { sweetVaults: displaySweetVaults },
  } = useFeatures();

  const formatter = Intl.NumberFormat("en", {
    //@ts-ignore
    notation: "compact",
  });

  return (
    <section className="mt-10">
      <h6 className="font-medium leading-8 mb-4">Featured</h6>
      <div className="border-t border-customLightGray">
        {displaySweetVaults && (
          <Product
            title="Sweet Vaults"
            description="Single-asset vaults to earn yield on your digital assets"
            stats={[
              {
                label: "TVL",
                content: "$3.7m",
                infoIconProps: {
                  title: "Total Value Locked",
                  content: "The total value of assets held by the underlying smart contracts.",
                  id: "sweet-vault-tvl",
                },
              },
            ]}
            route={`${networkName}/sweet-vaults`}
            badge="/images/newProductBadge.svg"
          />
        )}
        <Product
          title="3X"
          description="EUR & USD exposure with noble yield that funds social impact organizations"
          stats={[
            {
              label: "TVL",
              content: <Contract.Tvl chainId={Ethereum} address={threeX.address} />,
              infoIconProps: {
                title: "Total Value Locked",
                content: "The total value of assets held by the underlying smart contracts.",
                id: "btr-tvl",
              },
            },
            {
              label: "vAPR",
              content: <Staking.Apy chainId={Ethereum} address={threeXStaking.address} />,
              infoIconProps: {
                title: "Variable Annual Percentage Rate",
                content:
                  "This shows your interest stated as a yearly percentage rate, which is subject to change over time based on demand and market conditions.",
                id: "3x-vapr",
              },
            },
          ]}
          route={`${networkName}/set/3x`}
          customContent={ThreeXExposure}
        />
        <Product
          title="Butter"
          description="Optimize your yield while creating positive global impact."
          stats={[
            {
              label: "TVL",
              content: <Contract.Tvl chainId={Ethereum} address={butter.address} />,
              infoIconProps: {
                title: "Total Value Locked",
                content: "The total value of assets held by the underlying smart contracts.",
                id: "btr-tvl",
              },
            },
            {
              label: "vAPR",
              content: <Staking.Apy chainId={Ethereum} address={butterStaking.address} />,
              infoIconProps: {
                title: "Variable Annual Percentage Rate",
                content:
                  "This shows your interest stated as a yearly percentage rate, which is subject to change over time based on demand and market conditions.",
                id: "btr-vapr",
              },
            },
          ]}
          route={`${networkName}/set/butter`}
          customContent={ButterExposure}
        />
        <Product
          title="Staking"
          description="Single-asset vaults to earn yield on your digital assets"
          stats={[
            {
              label: "TVL",
              content:
                mainnetStakingTVL && polygonStakingTVL
                  ? `$${formatter.format(parseInt(formatUnits(mainnetStakingTVL.add(polygonStakingTVL))))}`
                  : "$0",
              infoIconProps: {
                title: "Total Value Locked",
                content: "The total value of assets held by the underlying smart contracts.",
                id: "staking-tvl",
              },
            },
          ]}
          route={`staking`}
        />
      </div>
    </section>
  );
};

const ButterExposure: JSX.Element = (
  <>
    <div className="flex gap-2 md:gap-0 md:space-x-2">
      <p className="text-primaryLight">Exposure</p>
      <InfoIconWithTooltip
        classExtras=""
        id="butter-exposure"
        title="Underlying Tokens"
        content="25.00% yvCurve-FRAX
      25.00% yvCurve-RAI
      25.00% yvCurve-mUSD
      25.00% yvCurve-alUSD
      
      BTR has exposure to: FRAX, RAI, mUSD, alUSD, sUSD and 3CRV (USDC/DAI/USDT)."
      />
    </div>
    <div className="flex relative mt-1">
      <img
        src="/images/tokens/boltLogo.svg"
        alt=""
        className="md:h-9 h-10 w-10 md:w-9 laptop:h-10 laptop:w-10 rounded-full relative"
      />
      <img
        src="/images/tokens/sUnderscore.svg"
        alt=""
        className="md:h-9 h-10 w-10 md:w-9 laptop:h-10 laptop:w-10 rounded-full relative -left-2"
      />
      <img
        src="/images/tokens/RAI.svg"
        alt=""
        className="md:h-9 h-10 w-10 md:w-9 laptop:h-10 laptop:w-10 rounded-full relative -left-4"
      />
      <img
        src="/images/tokens/sLogo.svg"
        alt=""
        className="md:h-9 h-10 w-10 md:w-9 laptop:h-10 laptop:w-10 rounded-full relative -left-6"
      />
      <img
        src="/images/tokens/sDiamondLogo.svg"
        alt=""
        className="md:h-9 h-10 w-10 md:w-9 laptop:h-10 laptop:w-10 rounded-full relative -left-8"
      />
      <img
        src="/images/tokens/threeCrv.svg"
        alt=""
        className="md:h-9 h-10 w-10 md:w-9 laptop:h-10 laptop:w-10 rounded-full relative -left-10"
      />
    </div>
  </>
);

const ThreeXExposure: JSX.Element = (
  <>
    <div className="flex gap-2 md:gap-0 md:space-x-2">
      <p className="text-primaryLight">Exposure</p>
      <InfoIconWithTooltip
        classExtras=""
        id="3x-exposure"
        title="Underlying Tokens"
        content="50% yvCurve-sUSDpool
50% yvCurve-3EURpool
3X has exposure to: sUSD, DAI, USDC, USDT, agEUR, EURT, and EURS."
      />
    </div>
    <div className="flex relative mt-1">
      <img
        src="/images/tokens/usdt.svg"
        alt=""
        className="md:h-9 h-10 w-10 md:w-9 laptop:h-10 laptop:w-10 rounded-full relative"
      />
      <img
        src="/images/tokens/Group 1104.svg"
        alt=""
        className={`md:h-9 h-10 w-10 md:w-9 laptop:h-10 laptop:w-10 rounded-full relative -left-2`}
      />
      <img
        src="/images/tokens/ageur.svg"
        alt=""
        className="md:h-9 h-10 w-10 md:w-9 laptop:h-10 laptop:w-10 rounded-full relative -left-4"
      />
      <img
        src="/images/tokens/multi-collateral-dai-dai-logo 1.svg"
        alt=""
        className="md:h-9 h-10 w-10 md:w-9 laptop:h-10 laptop:w-10 rounded-full relative -left-6"
      />
      <img
        src="/images/tokens/susd 1.svg"
        alt=""
        className="md:h-9 h-10 w-10 md:w-9 laptop:h-10 laptop:w-10 rounded-full relative -left-8"
      />
      <img
        src="/images/tokens/usd-coin-usdc-logo.svg"
        alt=""
        className="md:h-9 h-10 w-10 md:w-9 laptop:h-10 laptop:w-10 rounded-full relative -left-10"
      />
      <img
        src="/images/tokens/tether-usdt-logo.svg"
        alt=""
        className="md:h-9 h-10 w-10 md:w-9 laptop:h-10 laptop:w-10 rounded-full relative -left-12"
      />
    </div>
  </>
);

export default Products;
