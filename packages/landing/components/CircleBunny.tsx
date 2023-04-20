import React from "react";

interface Props {
  color: string;
}
const CircleBunny: React.FC<Props> = ({ color }) => {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M42 0C34.2685 0 28 6.2685 28 14C28 6.2685 21.7315 0 14 0C6.2685 0 0 6.2685 0 14V28C0 43.4642 12.5358 56 28 56C20.2685 56 14 49.7315 14 42H21C17.1337 42 14 38.8663 14 35C14 31.1337 17.1337 28 21 28C24.8663 28 28 31.1337 28 35C28 31.1337 31.1337 28 35 28C38.8663 28 42 31.1337 42 35C42 38.8663 38.8663 42 35 42H42C42 49.7315 35.7315 56 28 56C43.4642 56 56 43.4642 56 28V14C56 6.2685 49.7315 0 42 0ZM28 35C28 38.8663 24.8663 42 21 42H35C31.1337 42 28 38.8663 28 35Z" fill={color} />
    </svg>

  );
};

export default CircleBunny;
