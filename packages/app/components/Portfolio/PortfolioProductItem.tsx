import StatusWithLabel from "@popcorn/app/components/Common/StatusWithLabel";
import TokenIcon from "@popcorn/app/components/TokenIcon";
import React from "react";
import { useChainIdFromUrl } from "@popcorn/app/hooks/useChainIdFromUrl";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";

const PortfolioProductItem = () => {
  const chainId = useChainIdFromUrl();
  const { pop } = useDeployment(chainId);
  return (
    <div className="bg-customLightGray bg-opacity-25 rounded-lg grid grid-cols-12 p-6">
      <div className="col-span-12 md:col-span-4 flex items-center">
        <TokenIcon token={pop} chainId={chainId} fullsize />
        <h5 className="text-xl md:ml-2 mb-2 md:mb-0">Popcorn</h5>
      </div>

      <div className="col-span-12 md:col-span-2">
        <StatusWithLabel
          content="1,3M"
          label="TVL"
          infoIconProps={{
            id: "vAPR",
            title: "How we calculate the vAPR",
            content: "Hi!!!",
          }}
          isSmall
        />
      </div>
      <div className="col-span-12 md:col-span-2">
        <StatusWithLabel
          content="$500k"
          label="TVL"
          infoIconProps={{
            id: "vAPR",
            title: "How we calculate the vAPR",
            content: "Hi!!!",
          }}
          isSmall
        />
        <p className="text-tokenTextGray text-sm leading-6">450K POP</p>
      </div>
      <div className="col-span-12 md:col-span-2">
        <StatusWithLabel
          content="1,3M"
          label="TVL"
          infoIconProps={{
            id: "vAPR",
            title: "How we calculate the vAPR",
            content: "Hi!!!",
          }}
          isSmall
        />
      </div>
      <div className="col-span-12 md:col-span-2">
        <StatusWithLabel
          content="1,3M"
          label="TVL"
          infoIconProps={{
            id: "vAPR",
            title: "How we calculate the vAPR",
            content: "Hi!!!",
          }}
          isSmall
        />
      </div>
    </div>
  );
};

export default PortfolioProductItem;
