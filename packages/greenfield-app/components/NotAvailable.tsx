import React from "react";

export const NotAvailable: React.FC<{
  title: string;
  body: string;
  visible?: boolean;
  additionalStyles?: string;
  image?: string;
}> = ({ title, body, visible, additionalStyles, image }) => {
  if (visible === false) {
    return <></>;
  }
  return (
    <div className="bg-white border border-customLightGray rounded-lg p-6 md:py-20 md:px-10 flex flex-col justify-center md:items-center text-left md:text-center">
      <img src={image || "/images/emptyRecord.svg"} alt="Not Found Error" className="mb-6 w-20 md:w-auto" />
      <h2 className=" text-black font-normal text-3xl mb-2 leading-[110%]">{title}</h2>
      <p className="text-primaryDark">{body}</p>
    </div>
  );
};
