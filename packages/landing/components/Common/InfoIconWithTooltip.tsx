import ReactTooltip from "rc-tooltip";
import React from "react";

export interface InfoIconWithTooltipProps {
  title?: string;
  content: string | JSX.Element;
  id?: string;
  classExtras?: string;
  placement?: string;
}

export const InfoIconWithTooltip: React.FC<InfoIconWithTooltipProps> = ({ title, content, id, classExtras, placement }) => {
  return (
    <ReactTooltip
      id={id}
      placement={placement || "bottom"}
      overlayClassName=" w-60"
      data-html="true"
      overlay={
        <div className="text-black text-base leading-7">
          <h6 className="mb-1">{title}:</h6>
          <p className="text-primaryDark">{content}</p>
        </div>
      }
    >
      <div className="flex items-center">
        <img
          src="/images/icons/tooltip.svg"
          data-tip
          data-for={id}
          className={`cursor-pointer w-4 h-4 ${classExtras}`}
        />
      </div>
    </ReactTooltip>
  );
};
