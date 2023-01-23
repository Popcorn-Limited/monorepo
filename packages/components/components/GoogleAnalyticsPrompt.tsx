import { Transition } from "@headlessui/react";
import MainActionButton from "@popcorn/app/components/MainActionButton";
import React, { useEffect, useState } from "react";
import TertiaryActionButton from "@popcorn/app/components/TertiaryActionButton";
import { useFeatures } from "@popcorn/components/hooks/useFeatures";
import useInitializeGTM from "@popcorn/components/hooks/useInitializeGTM";

type WindowWithDataLayer = Window & {
  dataLayer: Record<string, any>[];
};

declare const window: WindowWithDataLayer;

const GoogleAnalyticsPrompt = () => {
  const {
    features: { optin_analytics: visible },
  } = useFeatures();

  const [openAnalyticsPrompt, setOpenAnalyticsPrompt] = useState(false);
  const initializeGTM = useInitializeGTM();

  useEffect(() => {
    localStorage.getItem("acceptAnalytics") ? setOpenAnalyticsPrompt(false) : setOpenAnalyticsPrompt(true);
    initializeGTM();
  }, []);

  const handleAccept = () => {
    localStorage.setItem("acceptAnalytics", "true");
    initializeGTM();
    setOpenAnalyticsPrompt(false);
  };

  const handleDecline = () => {
    localStorage.setItem("acceptAnalytics", "false");
    setOpenAnalyticsPrompt(false);
  };

  if (!visible) {
    return <></>;
  }

  return (
    <Transition show={openAnalyticsPrompt} as={React.Fragment}>
      <Transition.Child
        enter="transition ease-out duration-300 transform"
        enterFrom="opacity-0 translate-y-full"
        enterTo="opacity-100 translate-y-0"
        leave="transition transform ease-in duration-300"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-full"
        as={React.Fragment}
      >
        <div className="w-full fixed bottom-0 left-0 z-40">
          <div className="bg-white w-full py-6 px-8 rounded-t-4xl md:rounded-t-lg shadow-custom-2 flex flex-col md:flex-row items-center justify-center mx-auto space-y-6 md:space-y-0 md:space-x-10">
            <p className="text-primaryDark">
              This site uses Google analytics to enhance your experience, understand site usage, <br /> and assist in
              creating a better experience.
            </p>
            <div className="flex flex-col md:flex-row w-full md:w-auto space-y-4 md:space-y-0 md:space-x-6">
              <MainActionButton label="Opt-in" handleClick={handleAccept} />
              <TertiaryActionButton label="Opt-out" handleClick={handleDecline} />
            </div>
          </div>
        </div>
      </Transition.Child>
    </Transition>
  );
};
//
//

export default GoogleAnalyticsPrompt;
