import RightArrowIcon from "../SVGIcons/RightArrowIcon";
import React, { useState } from "react";

interface ButtonProps {
  label: string;
  handleClick?: (event: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  hidden?: boolean;
  customArrowColor?: string;
}
const SecondaryActionButton: React.FC<ButtonProps> = ({ label, handleClick, hidden, disabled = false, customArrowColor }) => {
  const [arrowColor, setArrowColor] = useState(customArrowColor || "645F4B");
  const [arrowClass, setArrowClass] = useState("transform translate-x-0");

  const animateArrow = () => {
    setArrowColor("000000");
    setArrowClass("transform -translate-x-1/2");
    setTimeout(() => {
      setArrowColor(customArrowColor || "645F4B");
      setArrowClass("transform translate-x-0");
    }, 500);
  };
  return (
    <button
      className={`${hidden ? "hidden" : ""
        } w-full flex justify-between items-center text-primary hover:text-black transition-all ease-in-out font-medium leading-4 md:leading-7 relative`}
      onMouseEnter={animateArrow}
      onClick={handleClick}
    >
      <span>{label}</span>
      <div className={`'absolute right-0 transition-all ease-in-out duration-500 ${arrowClass}`}>
        <RightArrowIcon color={arrowColor} />
      </div>
    </button>
  );
};

export default SecondaryActionButton;
