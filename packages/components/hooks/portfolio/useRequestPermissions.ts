import { useEffect, useState } from "react";

/*
 - https://docs.metamask.io/guide/ethereum-provider.html#ethereum-request-args
 - to be used potentially as a way to allow the user to select multiple accounts for viewing on the portfolio page
*/
export const useRequestPermissions = () => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  function requestPermissions() {
    setIsRequesting(true);
    // @ts-ignore
    window.ethereum
      .request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      })
      .then((permissions) => {
        const accountsPermission = permissions.find((permission) => permission.parentCapability === "eth_accounts");
        setIsRequesting(false);

        if (accountsPermission) {
          setIsSuccess(true);
          console.log("eth_accounts permission successfully requested!");
          return;
        }
        setIsSuccess(false);
      })
      .catch((error) => {
        setIsSuccess(false);
        setIsRequesting(false);
        setIsError(true);
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log("Permissions needed to continue.");
        } else {
          console.error(error);
        }
      });
  }

  useEffect(() => {
    if (isSuccess) {
      // @ts-ignore
      window.ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
        console.log(accounts);
      });
      // @ts-ignore
      window.ethereum.request({ method: "eth_accounts" }).then((_accounts) => {
        console.log({ eth_accounts: _accounts });
      });
    }
  }, [isSuccess]);
  return { isError, isRequesting, isSuccess, requestPermissions };
};
