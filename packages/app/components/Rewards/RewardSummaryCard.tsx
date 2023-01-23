import { InfoIconWithTooltip, InfoIconWithTooltipProps } from "@popcorn/app/components/InfoIconWithTooltip";
import MainActionButton from "@popcorn/app/components/MainActionButton";

interface RewardSummaryCardProps {
  iconUri: string;
  title: string;
  content: string;
  button?: boolean;
  handleClick?: Function;
  infoIconProps: InfoIconWithTooltipProps;
}

const RewardSummaryCard: React.FC<RewardSummaryCardProps> = ({
  button,
  title,
  content,
  iconUri,
  handleClick,
  infoIconProps,
}) => {
  return (
    <div className="bg-white border border-customLightGray p-6 rounded-lg w-full flex flex-col">
      <div className="w-full flex flex-col md:flex-row md:items-center">
        <div className="flex flex-row w-full sm:w-fit items-center gap-4 md:gap-0 md:space-x-4">
          <img src={iconUri} className="w-12 h-12" />
          <div className="flex flex-col items-start grow w-full justify-between pt-1">
            <div className="flex flex-row gap-2 md:gap-0 md:space-x-2 w-full items-center">
              <p className="font-normal leading-none text-primaryLight text-base">{title}</p>
              <InfoIconWithTooltip
                id={infoIconProps.id}
                title={infoIconProps.title}
                content={infoIconProps.content}
                classExtras={infoIconProps.classExtras}
              />
            </div>
            <p className="text-primary text-2xl">
              {content.split(" ")[0]} <span className=" text-tokenTextGray text-xl"> {content.split(" ")[1]}</span>
            </p>
          </div>
        </div>
        {button && (
          <div className="grow flex flex-row justify-end mt-6 md:mt-0">
            <div className="flex-row self-center grow sm:grow-0 sm:w-32 flex">
              <MainActionButton label="Claim all" handleClick={handleClick} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default RewardSummaryCard;
