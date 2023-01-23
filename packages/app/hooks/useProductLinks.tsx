import { useRouter } from "next/router";
import { useChainUrl } from "./useChainUrl";
import { useFeatures } from "@popcorn/components";

export const useProductLinks = () => {
  const url = useChainUrl();
  const router = useRouter();

  const {
    features: { sweetVaults: displaySweetVaults },
  } = useFeatures();
  return [
    {
      title: "3X",
      url: url("/set/3x"),
      currentlySelected: router?.pathname === "/[network]/set/3x",
    },
    {
      title: "Butter",
      url: url("/set/butter"),
      currentlySelected: router?.pathname === "/[network]/set/butter",
    },
    {
      title: "Sweet Vaults",
      url: "/sweet-vaults",
      currentlySelected: router?.pathname === "/sweet-vaults",
      hidden: !displaySweetVaults,
    },
    {
      title: "Staking",
      url: "/staking",
      currentlySelected: router?.pathname === "/staking",
    },
  ];
};
