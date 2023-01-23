import React from "react";

interface Props {
  extraClasses?: string;
}
const ConnectDepositCard: React.FC<Props> = ({ extraClasses }) => {
  return (
    <div
      className={`rounded-lg p-6 md:px-8 md:py-9 bg-customYellow flex flex-row md:flex-col justify-between ${
        extraClasses ? extraClasses : "h-full"
      }`}
    >
      <p className="text-2xl md:text-8xl leading-6 md:leading-13">
        Connect <br />
        Deposit <br />
        Do well <br />
        Do good
      </p>
      <div className="flex flex-col md:flex-row justify-end">
        <img src="/images/smiley.svg" alt="" />
      </div>
    </div>
  );
};

export default ConnectDepositCard;
