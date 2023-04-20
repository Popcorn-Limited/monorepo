import { FeatureToggleContext } from "@popcorn/greenfield-app/context/FeatureToggleContext";
import { useContext } from "react";

export const useFeatures = () => {
  const { features, setFeatures } = useContext(FeatureToggleContext);
  return { features, setFeatures };
};
