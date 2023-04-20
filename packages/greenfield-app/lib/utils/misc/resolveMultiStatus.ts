import { Pop } from "../../types";

/**
 * @description resolves multiple statuses into a single status. to be used when a component or a hook uses multiple queries and needs to return a single status
 */
export const resolveMultiStatus = ([...statuses]: Pop.UseQueryResult<any>["status"][]) =>
  statuses.reduce((acc, status) => {
    if (status === "error") return "error";
    if (status === "loading" && acc !== "error") return "loading";
    if (status === "success" && acc !== "error") return "success";
    if (status === "idle" && acc !== "error" && acc !== "loading" && acc !== "success") return "idle";
    return acc;
  }, "idle") as "error" | "loading" | "success" | "idle";

export default resolveMultiStatus;
