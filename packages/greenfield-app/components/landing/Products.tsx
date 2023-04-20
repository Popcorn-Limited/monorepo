import { ChainId } from "@popcorn/utils";
import { InfoIconWithTooltip } from "@popcorn/greenfield-app/components/InfoIconWithTooltip";
import { formatUnits } from "ethers/lib/utils";
import React from "react";
import Product from "components/landing/Product";
import useNetworkName from "@popcorn/greenfield-app/hooks/useNetworkName";
import { useNamedAccounts } from "@popcorn/greenfield-app/lib/utils/hooks";
import { Staking, Contract } from "@popcorn/greenfield-app/lib";
import { useFeatures } from "@popcorn/greenfield-app/hooks/useFeatures";
import Tvl from "@popcorn/greenfield-app/lib/Contract/Tvl";

const Products = () => {
  const { Ethereum, Polygon } = ChainId;

  const [popStaking] = useNamedAccounts("1", [
    "popStaking",
  ]);
  const [popStakingPolygon] = useNamedAccounts("137", ["popStaking"]);

  const {
    features: { sweetVaults: displaySweetVaults },
  } = useFeatures();

  const formatter = Intl.NumberFormat("en", {
    //@ts-ignore
    notation: "compact",
  });

  const {
    props: {
      data: { value: mainnetStakingTVL },
    },
  } = Tvl({ chainId: Ethereum, address: popStaking?.address });
  const {
    props: {
      data: { value: polygonStakingTVL },
    },
  } = Tvl({ chainId: Polygon, address: popStakingPolygon?.address });

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
            route={"sweet-vaults"}
            badge="/images/newProductBadge.svg"
          />
        )}
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
