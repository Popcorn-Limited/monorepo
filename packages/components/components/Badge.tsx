import { FC, ReactNode } from "react";
import classnames from "classnames";

export enum BadgeVariant {
  warning = "warning",
  success = "success",
  white = "white",
  primary = "primary",
  dark = "dark",
}

interface BadgeProps {
  variant: keyof typeof BadgeVariant;
  children: ReactNode;
}

export const Badge: FC<BadgeProps> = ({ variant, children }) => {
  return (
    <div className="flex items-center">
      <div
        className={classnames(
          " md:leading-6 rounded-2xl font-light md:font-medium tracking-[0.2px] text-black text-[10px] md:text-sm p-[6px] md:py-[6px] md:px-4",
          {
            "bg-customLightYellow": variant === BadgeVariant.warning,
            "bg-customLightGreen": variant === BadgeVariant.success,
            "bg-white": variant === BadgeVariant.white,
            "bg-warmGray": variant == BadgeVariant.primary,
            "bg-customLightGray": variant == BadgeVariant.dark,
          },
        )}
      >
        <p> {children}</p>
      </div>
    </div>
  );
};
