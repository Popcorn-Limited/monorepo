import { FeatureToggleContext } from "@popcorn/components/context/FeatureToggleContext";
import { useContext } from "react";

export const useFeatures = () => {
  const { features, setFeatures } = useContext(FeatureToggleContext);
  return { features, setFeatures };
};
