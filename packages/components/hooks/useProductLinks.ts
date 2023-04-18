import { useRouter } from "next/router";
import { useFeatures } from "@popcorn/components";

export const useProductLinks = () => {
  const router = useRouter();

  const {
    features: { sweetVaults: displaySweetVaults },
  } = useFeatures();
  return [
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
