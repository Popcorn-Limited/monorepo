import { setSingleActionModal } from "@popcorn/components/context/actions";
import { store } from "@popcorn/components/context/store";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { useContext, useEffect, useState } from "react";
import { useDisconnect } from "wagmi";

export default function OfacCheck(): JSX.Element {
  const { dispatch } = useContext(store);
  const { account } = useWeb3();
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
