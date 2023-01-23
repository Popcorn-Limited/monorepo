import MainActionButton from "@popcorn/app/components/MainActionButton";
import TertiaryActionButton from "@popcorn/app/components/TertiaryActionButton";
import React from "react";

const EmptyClaimableBatch = () => {
  return (
    <tr className="bg-white border-b border-gray-200 w-full">
      <td className="px-6 py-5 whitespace-nowrap">
        <p className="text-primaryLight mb-2">Deposited</p>
        <span className="flex flex-row items-center text-primary text-2xl">-</span>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <p className="text-primaryLight mb-2">Claimable</p>
        <p className="text-primary text-2xl">-</p>
      </td>
      <td className="px-6 py-5 h-full">
        <div className="space-x-4 flex flex-row items-center h-full w-80">
          <div className="">
            <MainActionButton label="Claim and Stake" disabled />
          </div>
          <div className="">
            <TertiaryActionButton label="Claim" disabled />
          </div>
        </div>
      </td>
    </tr>
  );
};

export default EmptyClaimableBatch;
