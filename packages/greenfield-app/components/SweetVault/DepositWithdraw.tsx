import type { Pop } from "@popcorn/components/lib/types";
import { Fragment, useState } from "react";

import TabSelector from "@popcorn/greenfield-app/components/TabSelector";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";

const TAB_DEPOSIT = "Deposit";
const TAB_WITHDRAW = "Withdraw";
const TABS = [TAB_DEPOSIT, TAB_WITHDRAW];

function DepositWithdraw({
  vault,
  vaultTokenAddress,
  vaultTokenDecimals,
  chainId,
}: {
  vault: Pop.NamedAccountsMetadata;
  vaultTokenAddress: string;
  vaultTokenDecimals: number;
  chainId: any;
}) {
  const [activeTab, setActiveTab] = useState(TAB_DEPOSIT);
  const isDepositTab = activeTab === TAB_DEPOSIT;

  const sharedProps = {
    vault,
    vaultTokenAddress,
    vaultTokenDecimals,
    chainId,
  };

  return (
    <Fragment>
      <TabSelector className="mb-6" availableTabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
      {isDepositTab ? <Deposit {...sharedProps} /> : <Withdraw {...sharedProps} />}
    </Fragment>
  );
}

export default DepositWithdraw;
