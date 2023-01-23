import { FeatureToggleContext } from "../context/FeatureToggleContext";
import { useContext, useState } from "react";
import { CheckCircle, Settings, X } from "react-feather";

export function FeatureTogglePanel(): JSX.Element {
  const developmentLike = (env: string) => env.includes("dev") || env.includes("staging");
  const enabled = developmentLike(process.env.APP_ENV || "");

  const [showPanel, setShowPanel] = useState(false);
  const { features, setFeatures } = useContext(FeatureToggleContext);

  function toggleFeature(feature: string) {
    const newFeatures = { ...features };
    newFeatures[feature] = !newFeatures[feature];
    setFeatures(newFeatures);
  }

  return (
    <div className={`card fixed bottom-1 right-1 z-30 ${(enabled && " ") || "hidden "}`}>
      {showPanel ? (
        <div className="flex flex-col p-2 space-y-2">
          <span className="flex flex-row items-center justify-end" onClick={() => setShowPanel(false)}>
            <X /> Close
          </span>
          {Object.keys(features).map((feature) => (
            <span key="feature" className="flex flex-row items-center card p-2" onClick={() => toggleFeature(feature)}>
              {features[feature] ? <CheckCircle size={16} /> : <X size={16} />} <p className="ml-2">{feature}</p>
            </span>
          ))}
        </div>
      ) : (
        <Settings size={24} onClick={() => setShowPanel(true)} />
      )}
    </div>
  );
}
export default FeatureTogglePanel;
