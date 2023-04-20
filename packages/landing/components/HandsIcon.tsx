import React from "react";

interface Props {
  color: string;
}
const HandsIcon: React.FC<Props> = ({ color }) => {
  return (
    <svg width="61" height="60" viewBox="0 0 61 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 40C21 51.045 29.955 60 41 60C52.045 60 61 51.045 61 40H21Z" fill={color} />
      <path d="M15.9998 49.9997C17.2798 49.9997 18.5598 49.5114 19.5348 48.5347C21.4881 46.5814 21.4881 43.4164 19.5348 41.463L9.53476 31.463C7.58142 29.5097 4.41643 29.5097 2.4631 31.463C0.509766 33.4164 0.509766 36.5814 2.4631 38.5347L12.4631 48.5347C13.4398 49.5114 14.7198 49.9997 15.9981 49.9997H15.9998Z" fill={color} />
      <path d="M21 5V35C21 37.7617 23.2383 40 26 40C28.7617 40 31 37.7617 31 35C31 37.7617 33.2383 40 36 40C38.7617 40 41 37.7617 41 35C41 37.7617 43.2383 40 46 40C48.7617 40 51 37.7617 51 35C51 37.7617 53.2383 40 56 40C58.7617 40 61 37.7617 61 35V5C61 2.23833 58.7617 0 56 0C53.2383 0 51 2.23833 51 5V25C51 22.2383 48.7617 20 46 20C43.2383 20 41 22.2383 41 25C41 22.2383 38.7617 20 36 20C33.2383 20 31 22.2383 31 25V5C31 2.23833 28.7617 0 26 0C23.2383 0 21 2.23833 21 5Z" fill={color} />
    </svg>


  );
};

export default HandsIcon;
