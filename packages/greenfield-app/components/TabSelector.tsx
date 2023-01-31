import { Dispatch } from "react";

// TODO use this or components/Tabs
interface TabSelectorProps {
  activeTab: any;
  setActiveTab: Dispatch<any>;
  availableTabs: any[];
  className?: string;
}

const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, setActiveTab, availableTabs, className }) => {
  return (
    <div className={`w-full flex flex-row ${className}`}>
      {availableTabs.map((tab) => (
        <div
          key={tab}
          className={`w-1/2 cursor-pointer ${
            activeTab === tab
              ? "border-b border-primaryLight"
              : "border-b border-customLightGray  group hover:border-primaryLight"
          }`}
          onClick={(e) => setActiveTab(tab)}
        >
          <p
            className={`text-base md:text-center mb-4 cursor-pointer word-spacing-full sm:word-spacing-normal ${
              activeTab === tab ? "text-primary font-medium" : "text-primaryLight group-hover:text-primary"
            }`}
          >
            {tab}
          </p>
        </div>
      ))}
    </div>
  );
};
export default TabSelector;
