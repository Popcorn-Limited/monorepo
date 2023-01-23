import MainActionButton from "@popcorn/app/components/MainActionButton";
import TertiaryActionButton from "@popcorn/app/components/TertiaryActionButton";
import React from "react";

const MobileEmptyClaimableBatches = () => {
  return (
    <div className="flex flex-col bg-white border-b border-gray-200 last:border-none last:rounded-b-2xl w-full py-6">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <p className="text-primaryLight font-normal">Deposited</p>
          <p className={`md:mt-1 text-black md:text-primary font-normal text-xl md:text-2xl leading-8`}>-</p>
        </div>
        <div className="col-span-6">
          <p className="text-primaryLight font-normal">Claimable</p>
          <p className={`md:mt-1 text-black md:text-primary font-normal text-xl md:text-2xl leading-8`}>-</p>
        </div>
      </div>
      <div className="flex flex-col">
        {" "}
        <div className="w-full mt-6">
          <MainActionButton disabled label="Claim & Stake" />
          <div className="w-full mt-6">
            <TertiaryActionButton label="Claim" disabled />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileEmptyClaimableBatches;
