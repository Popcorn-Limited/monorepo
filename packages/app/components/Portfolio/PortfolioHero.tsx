import StatusWithLabel from "@popcorn/app/components/Common/StatusWithLabel";
import React from "react";

const PortfolioHero = () => {
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-12 md:col-span-4">
        <h1 className="text-6xl leading-12">
          Your <br />
          Portfolio <br />
          Overview
        </h1>
        <p className="my-6 leading-5 text-primaryDark">
          A glance at your current Popcorn portfolio across different networks
        </p>
        <div className="flex">
          <StatusWithLabel
            content={`$3.4M`}
            label="Total Deposits"
            infoIconProps={{
              id: "vAPR",
              title: "How we calculate the vAPR",
              content: "Hello",
            }}
          />
          <div className="bg-gray-300 h-16 hidden md:block mx-6" style={{ width: "1px" }}></div>
          <StatusWithLabel
            content={`$3.4M`}
            label="Total Deposits"
            infoIconProps={{
              id: "vAPR",
              title: "How we calculate the vAPR",
              content: "Hello",
            }}
          />
        </div>
      </div>
      <div className="col-span-5 col-end-13 bg-customYellow rounded-lg md:block">
        <div className="w-full h-full flex justify-end items-end">
          <img src="/images/portfolio.svg" />
        </div>
      </div>
    </div>
  );
};

export default PortfolioHero;
