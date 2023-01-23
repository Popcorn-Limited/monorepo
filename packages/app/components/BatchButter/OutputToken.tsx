import { Token } from "@popcorn/utils/types";
import Image from "next/image";
import { Dispatch } from "react";
import PseudoRadioButton from "@popcorn/app/components/BatchButter/PseudoRadioButton";

interface OutputTokenProps {
  outputToken: Token[];
  selectToken: Dispatch<Token>;
  selectedToken: Token;
}

const OutputToken: React.FC<OutputTokenProps> = ({ outputToken, selectToken, selectedToken }) => {
  return (
    <div className="flex gap-4 flex-wrap">
      {outputToken.map((token) => (
        <div key={token.symbol}>
          <PseudoRadioButton
            label={
              <div className="flex items-center h-full">
                <span className="w-5 h-5 relative mr-2 flex-shrink-0">
                  <Image src={token.icon} alt={token.symbol + " icon"} priority={true} fill />
                </span>
                {token.symbol}
              </div>
            }
            activeClass="border-1 border-customBrown"
            isActive={selectedToken === token}
            handleClick={() => {
              selectToken(token);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default OutputToken;
