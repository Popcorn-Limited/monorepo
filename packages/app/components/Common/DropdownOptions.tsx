import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface FilterProps {
  options: Array<string> | { [key: string]: string }[];
  selectedItem: string | { name: string; link: string };
  switchFilter: (item: string | { [key: string]: string }) => void;
  position: string;
  width: string;
  borderRadius: string;
  borderRadiusFirstLast: string;
}

const BeneficiaryOptions: React.FC<FilterProps> = ({
  options,
  switchFilter,
  position,
  width,
  selectedItem,
  borderRadius,
  borderRadiusFirstLast,
}) => {
  const checkActiveItem = (item: any) => {
    if (typeof selectedItem === "string") {
      return selectedItem === item;
    } else {
      return selectedItem.link === item.link;
    }
  };
  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className={`${position} ${width} ${borderRadius} bg-white focus:outline-none`}>
        {options.map((item, index: number) => (
          <Menu.Item key={index}>
            {({ active }) => (
              <a
                className={`${
                  active || checkActiveItem(item) ? "bg-warmGray text-black font-medium" : "bg-white text-[#55503D] "
                } group px-6 py-4 block w-full h-full cursor-pointer border-gray-200 border-b border-x first:border-t ${borderRadiusFirstLast} text-left`}
                target="_blank"
                onClick={() => switchFilter(item)}
              >
                <p className="leading-none">{typeof item === "string" ? item : item.name || item.value}</p>
              </a>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Transition>
  );
};

export default BeneficiaryOptions;
