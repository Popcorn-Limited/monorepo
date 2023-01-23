import TagManager from "react-gtm-module";

const useInitializeGTM = () => {
  let userAnalyticsPreference =
    typeof window !== "undefined" && localStorage.getItem("acceptAnalytics")
      ? localStorage.getItem("acceptAnalytics") === "true"
      : false;
  return () => {
    if (process.env.NEXT_PUBLIC_GTM_ID && userAnalyticsPreference) {
      TagManager.initialize({
        gtmId: process.env.NEXT_PUBLIC_GTM_ID,
      });
    }
  };
};

export default useInitializeGTM;
