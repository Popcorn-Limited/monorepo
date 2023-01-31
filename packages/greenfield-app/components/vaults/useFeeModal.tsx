import Image from "next/image";
import { useContext } from "react";
import { constants } from "ethers";

import useVaultFees from "hooks/vaults/useVaultFees";
import { formatAndRoundBigNumber } from "@popcorn/utils";
import { setSingleActionModal } from "@popcorn/components/context/actions";
import { store } from "@popcorn/components/context/store";
import asset_fee from "@popcorn/greenfield-app/assets/fee.svg";

const ZERO = constants.Zero;
export default function useFeeModal(vaultAddress: string) {
  const { dispatch } = useContext(store);

  const hideModal = () => dispatch(setSingleActionModal(false));

  const openModal = () =>
    dispatch(
      setSingleActionModal({
        content: <FeeBreakdown vaultAddress={vaultAddress} />,
        image: <Image src={asset_fee} alt="" width={60} />,
        onDismiss: {
          onClick: hideModal,
        },
      }),
    );

  return {
    hideModal,
    openModal,
  } as const;
}

function FeeBreakdown({ vaultAddress }: { vaultAddress: string }) {
  const fees = useVaultFees(vaultAddress);

  return (
    <section className="text-primaryDark">
      <h2 className="text-lg mb-4">Fees are presubstracted from APY</h2>
      <table className="w-full table-auto">
        <tbody>
          <FeeRow fee={fees.deposit} title="Deposit fee" />
          <FeeRow fee={fees.withdrawal} title="Withdrawal fee" />
          <FeeRow fee={fees.management} title="Management fee" />
          <FeeRow fee={fees.performance} title="Performance fee" />
        </tbody>
      </table>
    </section>
  );
}

const FeeRow = ({ title, fee = ZERO }) => (
  <tr className="text-sm">
    <td>{title}</td>
    {/* We need to divide the fees by 1e18 and multiply them by 100 to get the actual percentage -> Divide by 1e16 */}
    <td className="text-right">{formatAndRoundBigNumber(fee, 16)}%</td>
  </tr>
);
