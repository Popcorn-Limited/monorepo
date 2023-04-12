import type { Pop } from "@popcorn/components/lib/types";
import { Fragment, useState } from "react";

import TabSelector from "@popcorn/greenfield-app/components/TabSelector";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import FeeBreakdown from "./FeeBreakdown";
import TokenIcon from "@popcorn/app/components/TokenIcon";
import { ArrowDownIcon } from "@heroicons/react/24/outline";

const TAB_DEPOSIT = "Deposit";
const TAB_WITHDRAW = "Withdraw";
const TABS = [TAB_DEPOSIT, TAB_WITHDRAW];

function DepositWithdraw({
  vault,
  asset,
  chainId,
  staking,
  pps,
  getTokenUrl,
  children
}: {
  vault: string;
  asset: string;
  chainId: any;
  staking: string;
  pps: number;
  getTokenUrl?: string;
  children?: React.ReactElement
}) {
  const [activeTab, setActiveTab] = useState(TAB_DEPOSIT);
  const isDepositTab = activeTab === TAB_DEPOSIT;

  children = <>
    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-customLightGray" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-4">
          <ArrowDownIcon
            className="h-10 w-10 p-2 text-customLightGray border border-customLightGray rounded-full cursor-pointer hover:text-primary hover:border-primary"
            aria-hidden="true"
            onClick={() => setActiveTab(isDepositTab ? TAB_WITHDRAW : TAB_DEPOSIT)}
          />
        </span>
      </div>
    </div>
    {children}
  </>

  const sharedProps = {
    vault,
    asset,
    chainId,
    staking,
    pps,
    children
  };

  return (
    <Fragment>
      <TabSelector className="mb-6" availableTabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
      {isDepositTab ? <Deposit {...sharedProps} getTokenUrl={getTokenUrl} /> : <Withdraw {...sharedProps} />}
    </Fragment>
  );
}

export default DepositWithdraw;
