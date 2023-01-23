import { FC } from "react";

export interface Badge {
  text: string;
  textColor: string;
  bgColor: string;
}

interface BadgeProps {
  badge: Badge;
}

const Badge: FC<BadgeProps> = ({ badge }) => {
  return <div className={`py-2 px-4 rounded-lg ${badge.textColor} ${badge.bgColor}`}>{badge.text}</div>;
};
export default Badge;
