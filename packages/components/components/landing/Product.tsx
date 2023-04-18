import MainActionButton from "@popcorn/components/components/MainActionButton";
import StatusWithLabel, { StatusWithLabelProps } from "@popcorn/components/components/StatusWithLabel";
import useNetworkName from "@popcorn/components/hooks/useNetworkName";
import Link from "next/link";
import React from "react";

export interface ProductProps {
  title: string;
  description: string;
  stats: [StatusWithLabelProps] | [StatusWithLabelProps, StatusWithLabelProps];
  route: string;
  customContent?: JSX.Element;
  badge?: string;
}

export default function Product({ title, description, stats, route, customContent, badge }: ProductProps): JSX.Element {
  return (
    <div className="border-b border-customLightGray  border-opacity-40 grid grid-cols-12 items-center gap-6 md:gap-8 py-7">
      <div className="col-span-12 md:col-span-4 order-1">
        <div className="relative flex flex-row">
          <p className="text-black text-4xl leading-9 md:leading-10 mb-2">{title}</p>
          {badge && <img src={badge} alt={`badge-${title}`} className="hidden md:inline-block ml-8 -mt-28" />}
        </div>
        <p className=" text-primaryDark">{description}</p>
      </div>

      <div className="col-span-12 md:col-span-3 md:order-2 hidden md:block">{customContent}</div>
      {customContent && (
        <div className="col-span-12 md:col-span-3 order-3 md:hidden">{customContent && customContent}</div>
      )}

      <div className="col-span-12 md:col-span-3 grid grid-cols-12 order-2 md:order-3">
        <div className="col-span-6">
          <StatusWithLabel content={stats[0].content} label={stats[0].label} infoIconProps={stats[0].infoIconProps} />
        </div>

        <div className="col-span-6">
          {stats.length === 2 && (
            <StatusWithLabel content={stats[1].content} label={stats[1].label} infoIconProps={stats[1].infoIconProps} />
          )}
        </div>
      </div>

      <div className="col-span-12 md:col-span-2 order-4">
        <Link href={`/${route}`} passHref>
          <MainActionButton label="View" />
        </Link>
      </div>
    </div>
  );
}
