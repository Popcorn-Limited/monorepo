import { useNetworth } from "../../context/Networth";
import { FormattedBigNumber } from "../FormattedBigNumber";
import { Pop } from "../types";
import useLog from "../utils/hooks/useLog";

export const BalanceOf = ({ address }: Pop.StdProps) => {
  const { state: _state } = useNetworth();
  const { value: stateValue, status: stateStatus } = _state["total"][address || ""] || {};
  return (
    <>
      <FormattedBigNumber value={stateValue} decimals={18} status={stateStatus ? stateStatus : "loading"} prefix="$" />
    </>
  );
};
