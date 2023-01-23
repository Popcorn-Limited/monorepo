import * as Icon from "react-feather";

function getIcon(icon: string): JSX.Element {
  switch (icon) {
    case "Lock":
      return <Icon.Lock />;
    case "Gift":
      return <Icon.Gift />;
    case "Money":
      return <Icon.DollarSign />;
    case "Key":
      return <Icon.Key />;
    case "Wait":
      return <Icon.Clock />;
  }
}

export interface CardIconProps {
  icon: string;
}

export default function CardIcon({ icon }: CardIconProps): JSX.Element {
  switch (icon) {
    case "Butter":
      return <img src="/images/icons/BTR.svg" alt="butter" className="w-18 h-18" />;
    case "3X":
      return <img src="/images/tokens/threexBig.svg" alt="3X" className="w-18 h-18" />;
    default:
      return (
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 flex-grow-0 border border-customLightGray`}
        >
          <div className="w-3/4 h-3/4 text-white">{getIcon(icon)}</div>
        </div>
      );
  }
}
