import React from "react";

interface IconProps {
  color: string;
  size: string;
}
const TelegramIcon: React.FC<IconProps> = ({ color, size }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_1743_38957)">
        <path
          d="M9.41718 15.9148L9.02018 21.4988C9.58818 21.4988 9.83418 21.2548 10.1292 20.9618L12.7922 18.4168L18.3102 22.4578C19.3222 23.0218 20.0352 22.7248 20.3082 21.5268L23.9302 4.5548L23.9312 4.5538C24.2522 3.0578 23.3902 2.4728 22.4042 2.8398L1.11418 10.9908C-0.338822 11.5548 -0.316822 12.3648 0.867178 12.7318L6.31018 14.4248L18.9532 6.5138C19.5482 6.1198 20.0892 6.3378 19.6442 6.7318L9.41718 15.9148Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_1743_38957">
          <rect width="24" height="24" fill="white" transform="translate(0 0.733887)" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default TelegramIcon;
