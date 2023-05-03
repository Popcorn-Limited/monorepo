import { useMemo } from "react";
import { Pop } from "../../types";
import { resolveMultiStatus } from "../misc";

/**
 * will resolve a status based on the status of multiple hooks
 */
export const useMultiStatus = ([...statuses]: Pop.UseQueryResult<any>["status"][]) => {
  return useMemo(() => resolveMultiStatus([...statuses]), [...statuses]);
};
