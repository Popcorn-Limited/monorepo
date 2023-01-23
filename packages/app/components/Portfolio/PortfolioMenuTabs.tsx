import CustomDropdown from "@popcorn/app/components/Common/CustomDropdown";
import React from "react";

type categoryFilterType = {
  id: string;
  value: string;
};

interface PortfolioMenuTabsProps {
  categoryFilter: categoryFilterType;
  onSetCategoryFilter: (item: categoryFilterType) => void;
  categories: Array<categoryFilterType>;
}
const PortfolioMenuTabs: React.FC<PortfolioMenuTabsProps> = ({ categoryFilter, onSetCategoryFilter, categories }) => {
  return (
    <div className="grid grid-cols-12 mt-20 gap-8">
      <div className="col-span-12 md:col-span-3">
        <CustomDropdown categoryFilter={categoryFilter} switchFilter={onSetCategoryFilter} categories={categories} />
      </div>
      <div className="col-span-12 md:col-span-4 md:col-end-13">
        <div className="flex justify-end space-x-4">
          <button className="border border-[#827D69] bg-[#827D69] py-[14px] px-5 rounded-[28px] text-white">All</button>
          <button className="border border-customLightGray py-[14px] px-5 rounded-[28px] text-[#55503D]">
            Products
          </button>
          <button className="border border-customLightGray py-[14px] px-5 rounded-[28px] text-[#55503D]">
            Rewards
          </button>
          <button className="border border-customLightGray py-[14px] px-5 rounded-[28px] text-[#55503D]">Assets</button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioMenuTabs;
