import { useEffect, useState } from "react";
import { useNamedAccounts } from "@popcorn/components/lib/utils/hooks";
import { useNetworth } from "@popcorn/components/context/Networth";
import { clearPopBalance, clearVestingBalance } from "@popcorn/components/reducers/networth";
import { Pop } from "../../lib/types";

export const useSupportedContracts = (selectedNetworks) => {
  const { dispatch } = useNetworth();
  const contractsEth = useNamedAccounts("1", [
    "pop",
    "popStaking",
    "threeX",
    "threeXStaking",
    "butter",
    "butterStaking",
    "xenStaking",
    "popUsdcArrakisVaultStaking",
  ]);

  const contractsPoly = useNamedAccounts("137", [
    "pop",
    "popStaking",
    "popUsdcSushiLP",
    "popUsdcArrakisVault",
    "popUsdcArrakisVaultStaking",
    "xPop",
  ]);
  const contractsBnb = useNamedAccounts("56", ["pop", "xPop", "rewardsEscrow"]);

  const contractsArbitrum = useNamedAccounts("42161", ["pop", "xPop"]);

  const contractsOp = useNamedAccounts("10", ["pop", "popUsdcArrakisVault"]);

  let allContracts = [...contractsEth, ...contractsPoly, ...contractsBnb, ...contractsArbitrum].map(
    (network) => network,
  ) as any;
  allContracts = allContracts.flat(1) as any as Pop.NamedAccountsMetadata[];
  
  const [selectedContracts, setSelectedContracts] = useState(allContracts);

  useEffect(() => {
    const findNetwork = (chainId) => selectedNetworks.includes(chainId);
    const filteredContracts = allContracts.filter((contract) => findNetwork(Number(contract.chainId)));

    // clear popBalance and vesting in the store
    clearPopBalance()(dispatch);
    clearVestingBalance()(dispatch);

    setSelectedContracts(filteredContracts);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetworks]);

  return selectedContracts;
};
