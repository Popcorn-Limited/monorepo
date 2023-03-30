import toast from "react-hot-toast";

type WaitForTx = {
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  onSuccess?: (txHash: string) => void;
  onError?: (txHash: string) => void;
};

const useWaitForTx = ({
  successMessage,
  loadingMessage = "Sending...",
  errorMessage,
  onSuccess,
  onError,
}: WaitForTx = {}) => {
  const waitForTx = (tx: { hash: string; wait: () => Promise<any> }, overrides: WaitForTx = {}) => {
    const { hash } = tx;
    const LOADING_MESSAGE = overrides.loadingMessage || loadingMessage;
    const ERROR_MESSAGE = overrides.errorMessage || errorMessage;
    const SUCESS_MESSAGE = overrides.successMessage || successMessage;

    const toastId = toast.loading(LOADING_MESSAGE, {
      position: "top-center",
      duration: 7_000, // terminate after 1secs
    });

    (tx?.wait || Promise.resolve)()
      .then(() => {
        toast.dismiss(toastId);
        if (SUCESS_MESSAGE) {
          toast.success(SUCESS_MESSAGE, {
            position: "top-center",
          });
        }
        (overrides.onSuccess || onSuccess)?.(hash);
      })
      .catch(() => {
        if (ERROR_MESSAGE) {
          toast.error(ERROR_MESSAGE, {
            position: "top-center",
          });
        }
        (overrides.onError || onError)?.(hash);
      });
  };

  return { waitForTx };
};

export default useWaitForTx;
