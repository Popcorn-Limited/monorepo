import defaultFeatureFlags from "@popcorn/greenfield-app/defaultFeatureFlags";
import { createContext, useState } from "react";

export const FeatureToggleContext = createContext({
  features: defaultFeatureFlags,
  setFeatures: (newFeatures) => { },
});

export const FeatureToggleProvider = (props) => {
  const setFeatures = (newFeatures) => {
    setState({ features: newFeatures, setFeatures: setFeatures });
  };

  const initState = {
    features: defaultFeatureFlags,
    setFeatures: setFeatures,
  };

  const [state, setState] = useState(initState);

  return <FeatureToggleContext.Provider value={state}>{props.children}</FeatureToggleContext.Provider>;
};
