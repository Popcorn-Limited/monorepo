import { setSingleActionModal } from "@popcorn/greenfield-app/context/actions";
import { store } from "@popcorn/greenfield-app/context/store";
import { useContext, useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";

export default function OfacCheck(): JSX.Element {
  const { dispatch } = useContext(store);
  const { address: account } = useAccount();
  const [data, setData] = useState<{ success: boolean; permitted: boolean }>(null);
  const [isLoading, setLoading] = useState(false);
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (!account) return;
    setLoading(true);
    fetch(`/api/checkOfac?address=${account}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [account]);

  useEffect(() => {
    if (isLoading || !data) return;
    if (data.success && !data.permitted) {
      dispatch(
        setSingleActionModal({
          keepOpen: true,
          title: "Authorization Error",
          content: "The connected wallet is not authorized to make transactions with this application",
          onConfirm: { label: "Disconnect Wallet", onClick: disconnect },
        }),
      );
    }
  }, [data, isLoading]);

  return <></>;
}
