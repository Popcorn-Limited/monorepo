import { Dispatch } from "react";

interface TokenInputToggleProps {
  state: [Boolean, Dispatch<boolean>];
  labels: [string, string];
}

enum InteractionType {
  Deposit,
  Withdraw,
}

const TokenInputToggle: React.FC<TokenInputToggleProps> = ({ state, labels }) => {
  const [visible, toggle] = state;
  return (
    <div className="flex flex-row">
      <div
        className={`w-1/2 border-b ${
          visible ? "border-secondaryLight cursor-pointer group hover:border-primary" : "border-primary"
        }`}
        onClick={(e) => toggle(false)}
      >
        <p
          className={`text-center leading-none text-base cursor-pointer mb-4 mt-2 ${
            visible ? "text-primaryLight group-hover:text-primary" : "text-primary font-medium"
          }`}
        >
          {labels[0]}
        </p>
      </div>
      <div
        className={`w-1/2 ${
          visible
            ? "border-b border-primary"
            : "border-b border-secondaryLight cursor-pointer group hover:border-primary"
        }`}
        onClick={(e) => toggle(true)}
      >
        <p
          className={`text-center leading-none text-base cursor-pointer mb-4 mt-2 ${
            visible ? "text-primary  font-medium" : "text-primaryLight group-hover:text-primary"
          }`}
        >
          {labels[1]}
        </p>
      </div>
    </div>
  );
};
export default TokenInputToggle;
