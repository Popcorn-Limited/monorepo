import { InfoIconWithTooltip } from "./InfoIconWithTooltip";

interface InfoIconProps {
  id: string;
  title: string;
  content: string | React.ReactElement;
}

export interface StatusWithLabelProps {
  content: string | JSX.Element | React.ReactElement;
  label: string | JSX.Element;
  infoIconProps?: InfoIconProps;
  green?: boolean;
  isSmall?: boolean;
}

export default function StatusWithLabel({
  content,
  label,
  green = false,
  infoIconProps = null,
  isSmall = false,
}: StatusWithLabelProps): JSX.Element {
  return (
    <div className="flex flex-col">
      {infoIconProps ? (
        <span className="flex flex-row items-center">
          <p className="text-primaryLight">{label}</p>
          <InfoIconWithTooltip
            classExtras="mt-0 ml-2"
            id={infoIconProps.id}
            title={infoIconProps.title}
            content={infoIconProps.content}
            placement="right"
          />
        </span>
      ) : (
        <p className="text-primaryLight">{label}</p>
      )}
      {content == "Coming Soon" || typeof content !== "string" ? (
        <div
          className={`md:mt-1 text-primary font-light text-2xl ${!isSmall && "md:text-3xl"} leading-6 ${!isSmall && "md:leading-8"
            }`}
        >
          {content}
        </div>
      ) : (
        <p
          className={`md:mt-1 text-primary font-light text-2xl ${!isSmall && "md:text-3xl"} leading-6  ${!isSmall && "md:leading-8"
            } `}
        >
          {content.split(" ")[0]} <span className=" text-tokenTextGray text-xl"> {content.split(" ")[1]}</span>
        </p>
      )}
    </div>
  );
}
