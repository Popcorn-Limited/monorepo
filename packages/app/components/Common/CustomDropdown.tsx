import { Menu } from "@headlessui/react";
import { ViewGridIcon } from "@heroicons/react/outline";
import { ChevronDownIcon } from "@heroicons/react/solid";
import DropdownOptions from "@popcorn/app/components/Common/DropdownOptions";
import React, { FC } from "react";
import { MobilePopupSelect } from "@popcorn/app/components/Common/MobilePopupSelect";

interface IFilter {
  categoryFilter: { id: string; value: string };
  switchFilter: (item: { id: string; value: string }) => void;
  categories: Array<{ id: string; value: string }>;
}

const CustomDropdown: FC<IFilter> = ({ categoryFilter, switchFilter, categories }) => {
  const [openFilter, setOpenFilter] = React.useState(false);
  return (
    <>
      <div className="hidden md:block w-full">
        <Menu>
          <Menu.Button className="bg-white rounded-4xl border border-gray-300 relative w-full px-6 py-4">
            <div className="cursor-pointer h-full flex flex-row items-center justify-between relative w-full text-[#55503D]">
              <div className="flex items-center">
                <ViewGridIcon className="w-5 h-5 mr-3" />
                <p className="leading-none text-black">{categoryFilter.value}</p>
              </div>
              <ChevronDownIcon className="w-5 h-5" aria-hidden="true" />
            </div>
            <DropdownOptions
              options={categories}
              switchFilter={switchFilter}
              position="absolute top-12 left-0 z-40"
              width="w-full"
              borderRadius="rounded"
              borderRadiusFirstLast="first:rounded-t last:rounded-b"
              selectedItem={categoryFilter.id}
            />
          </Menu.Button>
        </Menu>
      </div>
      <div className="block md:hidden">
        <button
          onClick={(e) => {
            e.preventDefault();
            setOpenFilter(true);
          }}
          className="w-full py-3 px-5 flex flex-row items-center justify-between mt-1 space-x-1 rounded border border-gray-300"
        >
          <div className="flex items-center">
            <p className="ml-1 leading-none text-black text-base">{categoryFilter.value}</p>
          </div>
          <ChevronDownIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
      <div className="no-select-dot">
        <MobilePopupSelect
          categories={categories}
          visible={openFilter}
          onClose={setOpenFilter}
          selectedItem={categoryFilter}
          switchFilter={switchFilter}
        />
      </div>
    </>
  );
};

export default CustomDropdown;
