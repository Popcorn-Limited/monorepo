import React, { Fragment } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { Menu, Transition } from "@headlessui/react";
import { SortingType } from "@popcorn/greenfield-app/lib/utils";

// TODO make generalized
interface DropdownProps {
  sorting: [SortingType, React.Dispatch<SortingType>];
  position: string;
  width: string;
}

const Dropdown: React.FC<DropdownProps> = ({ position, sorting, width }) => {
  const [sortingType, setSortingType] = sorting;

  const labels = ["Highest Holding Value", "Lowest Holding Value"];

  return (
    <Menu>
      <Menu.Button className="bg-transparent rounded-4xl border border-customLightGray border-opacity-60 relative px-6 py-4">
        <div className="cursor-pointer h-full flex flex-row items-center space-x-16 relative w-full text-[#55503D]">
          <div className="flex items-center">
            {/* {categoryFilter.value} */}
            <p className="leading-none text-secondaryDark">{labels[Number(sortingType)]}</p>
          </div>
          <ChevronDownIcon className="w-4 h-4" aria-hidden="true" />
        </div>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className={`${position} ${width} rounded bg-white focus:outline-none`}>
          {labels.map((item, index: number) => (
            <Menu.Item key={item}>
              {({ active }) => (
                <a
                  className={`${
                    active || index === Number(sortingType)
                      ? "bg-warmGray text-black font-medium"
                      : "bg-white text-[#55503D] "
                  } group px-6 py-4 block w-full h-full cursor-pointer border-gray-200 border-b border-x first:border-t first:rounded-t last:rounded-b text-left`}
                  target="_blank"
                  onClick={() => setSortingType(index)}
                >
                  <p className="leading-none">{labels[index]}</p>
                </a>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default Dropdown;
