import React from "react";
import StatusWithLabel, { StatusWithLabelProps } from "@popcorn/app/components/Common/StatusWithLabel";
import Link from "next/link";

export interface ProductProps {
  title: string;
  description: string;
  stats: [StatusWithLabelProps] | [StatusWithLabelProps, StatusWithLabelProps];
  route: string;
  customContent?: JSX.Element;
  badge?: string;
}

export default function Product({ title, description, stats, badge, customContent, route }: ProductProps): JSX.Element {
  return (
    <Link
      target="_blank"
      href={route}
      className="group border rounded lg:w-screen max-w-[25rem] lg:max-w-[21.5rem] flex relative flex-col bg-[#FAF9F4] border-warmGray border-opacity-75 items-center gap-6 md:gap-8 p-7"
    >
      {badge && (
        <img
          src={badge}
          alt={`badge-${title}`}
          className="hidden w-16 md:inline-block absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
        />
      )}
      <div className="col-span-12 md:col-span-4">
        <div className="relative flex flex-row">
          <p className="text-black text-4xl leading-9 md:leading-10 mb-2">{title}</p>
        </div>
        <p className=" text-primaryDark">{description}</p>
      </div>

      <div className="flex flex-grow items-center justify-end w-full my-8">{customContent}</div>
      <div className="flex justify-between w-full">
        <StatusWithLabel content={stats[0].content} label={stats[0].label} infoIconProps={stats[0].infoIconProps} />
        {stats.length === 2 && (
          <StatusWithLabel content={stats[1].content} label={stats[1].label} infoIconProps={stats[1].infoIconProps} />
        )}
      </div>
    </Link>
  );
}
