import { InfoIconWithTooltip } from "@popcorn/app/components/InfoIconWithTooltip";
import { formatUnits } from "ethers/lib/utils";
import useNetWorth from "@popcorn/app/hooks/useNetWorth";

export function NetworthCard({ hidden }): JSX.Element {
  const { totalNetWorth } = useNetWorth();
  const formatter: Intl.NumberFormat = Intl.NumberFormat("en", {
    //@ts-ignore
    notation: "compact",
  });
  return (
    <div
      className={`col-span-7 md:col-span-12 rounded-lg border border-customLightGray p-5 md:py-7 md:mt-6 ${
        hidden ? "hidden" : ""
      }`}
    >
      <div className="flex items-center gap-2 md:gap-0 md:space-x-2 mb-1 md:mb-2">
        <p className="text-primaryLight leading-5 hidden md:block">My Net Worth</p>
        <p className="text-primaryLight leading-5 md:hidden">MNW</p>
        <InfoIconWithTooltip
          classExtras=""
          id="hero-mnw"
          title="Net Worth"
          content="This value aggregates your Popcorn-related holdings across all blockchain networks."
        />
      </div>
      <p className="text-primary text-xl md:text-4xl leading-5 md:leading-8">
        ${formatter.format(parseInt(formatUnits(totalNetWorth)))}
      </p>
    </div>
  );
}
