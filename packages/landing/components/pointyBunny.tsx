import React from "react";

interface Props {
  color: string;
}
const PointyBunny: React.FC<Props> = ({ color }) => {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 0V30C60 46.5687 46.5687 60 30 60C38.2837 60 45 53.2837 45 45H37.5C41.6425 45 45 41.6425 45 37.5C45 33.3575 41.6425 30 37.5 30C33.3575 30 30 33.3575 30 37.5C30 33.3575 26.6425 30 22.5 30C18.3575 30 15 33.3575 15 37.5C15 41.6425 18.3575 45 22.5 45H15C15 53.2837 21.7163 60 30 60C13.4312 60 0 46.5687 0 30V0C16.5688 0 30 13.4312 30 30C30 13.4312 43.4313 0 60 0Z" fill={color} />
    </svg>


  );
};

export default PointyBunny;
