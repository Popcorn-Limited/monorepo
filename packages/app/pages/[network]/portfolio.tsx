import NetWorthCard from "@popcorn/app/components/Portfolio/NetWorthCard";
import PortfolioCardCon from "@popcorn/app/components/Portfolio/PortfolioCardCon";
import PortfolioHero from "@popcorn/app/components/Portfolio/PortfolioHero";
import PortfolioMenuTabs from "@popcorn/app/components/Portfolio/PortfolioMenuTabs";
import React, { useState } from "react";

const allNetworks = [
  {
    id: "0",
    value: "All Networks",
  },
  {
    id: "1337",
    value: "Ethereum",
  },
  {
    id: "1",
    value: "Localhost",
  },
  {
    id: "137",
    value: "Polygon",
  },
];
const portfolio = () => {
  const [categoryFilter, setCategoryFilter] = useState<{ id: string; value: string }>({
    id: "0",
    value: "All Networks",
  });
  return (
    <>
      <PortfolioHero />
      <PortfolioMenuTabs
        categoryFilter={categoryFilter}
        onSetCategoryFilter={setCategoryFilter}
        categories={allNetworks}
      />
      <div className="grid grid-cols-12 gap-8 mt-10">
        <div className="col-span-12 md:col-span-3">
          <NetWorthCard />
        </div>
        <div className="col-span-12 md:col-span-9">
          <PortfolioCardCon cardTitle="Products" />
          <PortfolioCardCon cardTitle="Rewards" />
          <PortfolioCardCon cardTitle="Assets" />
        </div>
      </div>
    </>
  );
};

export default portfolio;
