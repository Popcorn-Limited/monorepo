import { SWRResponse } from "swr";
import { Pop } from "../../types";

export const popHookAdapter = (response: SWRResponse): Pop.HookResult<SWRResponse["data"]> => {
  return {
    ...response,
    data: response.data,
    status:
      !response.data && !response.isValidating
        ? "idle"
        : response.isValidating && !response.data
        ? "loading"
        : response.error
        ? "error"
        : "success",
  };
};
