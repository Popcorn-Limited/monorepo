import React from "react";
import PortfolioItem from "@popcorn/app/components/Portfolio/PortfolioItem";

interface PortfolioCardCon {
  cardTitle: string;
}
const PortfolioCardCon = ({ cardTitle }) => {
  return (
    <div className=" mb-[120px]">
      <p className=" font-medium leading-4 pb-4 border-b border-customLightGray">{cardTitle}</p>
      <PortfolioItem />
    </div>
  );
};

export default PortfolioCardCon;
