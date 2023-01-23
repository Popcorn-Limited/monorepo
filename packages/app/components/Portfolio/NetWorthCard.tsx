import React from "react";

const NetWorthCard = () => {
  return (
    <div className="bg-warmGray rounded-lg p-6">
      <h6 className="font-medium">My Net Worth </h6>
      <p className=" text-[40px] mt-6 font-light">$46,000.00</p>

      <div className="flex text-white text-xs my-6">
        <div className="bg-customLightPurple py-6 px-4 w-2/4 rounded-tl-5xl rounded-bl-5xl">50%</div>
        <div className="bg-customPurple py-6 px-2 w-1/4">25%</div>
        <div className="bg-customDarkPurple py-6 px-2 w-1/4 rounded-tr-5xl rounded-br-5xl">25%</div>
      </div>

      <div>
        <div className="flex items-center">
          <div className="bg-customLightPurple w-2 h-2 rounded-full"></div>
          <p className="text-customBrown ml-2 leading-6">Total Deposits</p>
        </div>
        <div className="grid grid-cols-12 ml-4 mt-1">
          <div className="col-span-6">
            <p>$23,000.00</p>
          </div>
          <div className="col-span-6">
            <p>50%</p>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center">
          <div className="bg-customLightPurple w-2 h-2 rounded-full"></div>
          <p className="text-customBrown ml-2 leading-6"> Vesting</p>
        </div>
        <div className="grid grid-cols-12 ml-4 mt-1">
          <div className="col-span-6">
            <p>$10,000.00</p>
          </div>
          <div className="col-span-6">
            <p>25%</p>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center">
          <div className="bg-customLightPurple w-2 h-2 rounded-full"></div>
          <p className="text-customBrown ml-2 leading-6">In Wallet</p>
        </div>
        <div className="grid grid-cols-12 ml-4 mt-1">
          <div className="col-span-6">
            <p>$13,000.00</p>
          </div>
          <div className="col-span-6">
            <p>25%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetWorthCard;
