import { formatAndRoundBigNumber } from "@popcorn/utils";
import { constants } from "ethers";
import useVaultFees from "hooks/vaults/useVaultFees";

function FeeBreakdown({ vault, ActionableComponent }: { vault: string, ActionableComponent?: () => JSX.Element }): JSX.Element {
  const fees = useVaultFees(vault);

  return (
    <div className="mt-12">
      <p className="mb-2 text-primary">Fee Breakdown</p>
      <section className="bg-warmGray/20 rounded-lg w-full mb-10">
        <div className="w-full py-1">
          <FeeRow fee={fees.deposit} title="Deposit fee" />
          <FeeRow fee={fees.withdrawal} title="Withdrawal fee" />
          <FeeRow fee={fees.management} title="Management fee" />
          <FeeRow fee={fees.performance} title="Performance fee" />
        </div>
      </section>
    </div>
  )
}

export default FeeBreakdown;

const FeeRow = ({ title, fee = constants.Zero }) => (
  <div className="text-sm flex flex-row items-center justify-between my-2 mx-4">
    <p className="text-primary">{title}</p>
    {/* We need to divide the fees by 1e18 and multiply them by 100 to get the actual percentage -> Divide by 1e16 */}
    <p className="text-primary">{formatAndRoundBigNumber(fee, 16)}%</p>
  </div>
);