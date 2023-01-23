import { Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/outline";
import Badge from "@popcorn/app/components/Common/Badge";
import StatusWithLabel from "@popcorn/app/components/Common/StatusWithLabel";
import SecondaryActionButton from "@popcorn/app/components/SecondaryActionButton";
import React, { useState } from "react";
import PortfolioProductItem from "@popcorn/app/components/Portfolio/PortfolioProductItem";

const PortfolioItem = () => {
  const badge = {
    text: "5 contracts",
    textColor: "text-black",
    bgColor: "bg-customYellow",
  };
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div
      className="border-b border-customLightGray px-6 py-8"
      onClick={() => {
        setExpanded(!expanded);
      }}
    >
      <div className="flex justify-between">
        <div className="flex flex-col md:flex-row md:items-center">
          <h3 className="text-3xl md:text-4xl mb-2 md:mb-0 font-normal leading-9">Staking</h3>
          {
            <div className="md:pl-2">
              <Badge badge={badge} />
            </div>
          }
        </div>
        <ChevronDownIcon
          className={`${
            expanded ? "rotate-180" : "rotate-0"
          } transform transition-all ease-in-out w-6 text-secondaryLight`}
        />
      </div>

      <div className="grid grid-cols-12 mt-10 mb-6">
        <div className="col-span-12 md:col-span-3">
          <StatusWithLabel
            content="1,3M"
            label="TVL"
            infoIconProps={{
              id: "vAPR",
              title: "How we calculate the vAPR",
              content: "Hi!!!",
            }}
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <StatusWithLabel
            content="55.39%"
            label="vAPR"
            infoIconProps={{
              id: "vAPR",
              title: "How we calculate the vAPR",
              content: "Hi!!!",
            }}
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <StatusWithLabel
            content="$10,000"
            label="Deposited"
            infoIconProps={{
              id: "vAPR",
              title: "How we calculate the vAPR",
              content: "Hi!!!",
            }}
          />
        </div>
      </div>
      <Transition
        show={expanded}
        enter="translate transition duration-500 delay-200 ease-in"
        enterFrom="transform -translate-y-10 md:-translate-y-16 opacity-0"
        enterTo="transform translate-y-0 opacity-100"
        leave="translate transition duration-500 ease-out"
        leaveFrom="transform translate-y-0 opacity-100"
        leaveTo="transform -translate-y-10 md:-translate-y-16 opacity-0"
      >
        <div className="py-6">
          <PortfolioProductItem />
          <div
            className=" rounded-lg md:border md:border-customLightGray px-0 pt-4 md:p-6 md:pb-0 mt-6 group"
            role="button"
          >
            <p className=" text-primary leading-6 mb-2">Total Unclaimed Rewards</p>
            <p className="text-primary text-2xl leading-6">$1,500.00</p>
            <div className="border md:border-0 md:border-t border-customLightGray rounded-lg md:rounded-none px-6 md:px-0  py-6 md:py-2 md:mt-4">
              <div>
                <SecondaryActionButton label="Rewards Page" />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default PortfolioItem;
