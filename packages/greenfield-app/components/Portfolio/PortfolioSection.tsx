import { BigNumber, constants } from "ethers";
import { InfoIconWithTooltip } from "@popcorn/greenfield-app/components/InfoIconWithTooltip";
import { formatAndRoundBigNumber } from "@popcorn/utils";

import { NotAvailable } from "@popcorn/greenfield-app/components/NotAvailable";
import NetworkIconList from "@popcorn/greenfield-app/components/NetworkIconList";
import { getPercentage } from "@popcorn/greenfield-app/lib/utils/numbers";

export default function PortfolioSection({
  selectedNetworks,
  selectedSections,
  children,
  balance,
  networth,
  title,
  sectionKeyName,
}: {
  selectedNetworks: any;
  selectedSections: string[];
  children: any;
  title: string;
  networth: BigNumber;
  balance?: BigNumber;
  sectionKeyName?: string;
}) {
  const balanceGTZero = balance?.gt(0);
  const networkListComponent = (
    <div className="flex items-center gap-5">
      <h2 className="text-2xl md:text-3xl leading-6 md:leading-8 font-normal">{title}</h2>
      <NetworkIconList networks={selectedNetworks} />
    </div>
  );

  const showSection = selectedSections.includes(sectionKeyName || title);
  const distribution = getPercentage(networth, balance);
  return (
    <section className={`px-4 md:px-8 ${showSection || "hidden"}`}>
      <div className={`mt-8 mb-2 md:hidden`}>{networkListComponent}</div>
      <table className={`table w-full table-fixed border-separate border-spacing-y-4`}>
        <thead>
          <tr
            data-dev-note="relative - fixes sticky position issue by children tooltip"
            className="whitespace-nowrap relative"
          >
            <th className="w-[40%] sm:w-[50%] md:w-[60%] opacity-0 md:opacity-100">{networkListComponent}</th>
            <th className="text-primary text-lg font-medium px-2">
              <div className="flex items-center gap-2">
                <p className="text-primaryLight text-sm md:text-base">Allocation</p>
                <InfoIconWithTooltip
                  classExtras=""
                  id="portfolio-percentage-tooltip"
                  title="Allocation"
                  content="The percentage weight of your holding."
                />
              </div>
              <div className="text-left text-sm md:text-lg">{distribution}%</div>
            </th>
            <th className="text-primary text-lg font-medium px-2">
              <div className="flex items-center space-x-2">
                <p className="text-primaryLight text-sm md:text-base">Balance</p>
                <InfoIconWithTooltip
                  classExtras=""
                  id="portfolio-balance-tooltip"
                  title="Balance"
                  content="The value of your position in USD equivalent."
                />
              </div>
              <div className="text-left text-sm md:text-lg">
                ${formatAndRoundBigNumber(balance || constants.Zero, 18)}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      <div className={`mb-8 ${balanceGTZero && "hidden"}`}>
        <NotAvailable title={`No ${title} available`} body={""} image="/images/emptyRecord.svg" />
      </div>
    </section>
  );
}
