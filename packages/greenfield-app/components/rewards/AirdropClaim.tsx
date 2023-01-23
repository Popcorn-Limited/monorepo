import { ChainId } from "@popcorn/utils";
import { Token } from "@popcorn/utils/src/types";
import { BigNumber, constants } from "ethers";
import { useState } from "react";
import * as Icon from "react-feather";
import TokenInput from "@popcorn/app/components/Common/TokenInput";
import MainActionButton from "@popcorn/app/components/MainActionButton";
import useXPOPRedemption from "hooks/xPopRedemption/useXPOPRedemption";

interface AirDropClaimProps {
  chainId: ChainId;
}

const AirDropClaim: React.FC<AirDropClaimProps> = ({ chainId }) => {
  const {
    approveXpopRedemption: approve,
    redeemXpop: redeem,
    balancesXPop,
    balancesPop,
    xPop,
    pop,
  } = useXPOPRedemption(chainId);
  const balances = [balancesXPop, balancesPop];
  const tokens = [xPop, pop];

  const [inputAmount, setInputAmount] = useState<BigNumber>(BigNumber.from(0));

  return (
    <div className="bg-white rounded-3xl px-5 pt-14 pb-6 border border-gray-200 shadow-custom">
      <div className="flex flex-col justify-between items-start">
        <TokenInput
          chainId={chainId}
          token={tokens[0]}
          label={"Redeem Amount"}
          balance={balances[0].balance}
          amount={inputAmount}
          setAmount={(n) => setInputAmount(n)}
        />
        <div className="w-full relative mt-10 mb-2">
          <div className={`relative flex justify-center`}>
            <div className="w-20 bg-white">
              <div className="flex items-center justify-center w-14 h-14 mx-auto border border-gray-300 rounded-full cursor-pointer">
                <Icon.ArrowDown height={24} width={24} strokeWidth={1.5} color="gray" />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full mt-6">
          <TokenInput
            chainId={chainId}
            token={tokens[1]}
            label={""}
            amount={inputAmount}
            setAmount={(n) => setInputAmount(n)}
            readonly
          />
        </div>
      </div>
      <div className="w-full text-center mt-10 space-y-4">
        {(balances[0].allowance.lte(BigNumber.from(0)) || balances[0].allowance.lt(inputAmount)) && (
          <MainActionButton label={`Approve xPOP`} handleClick={approve} disabled={inputAmount.isZero()} />
        )}
        <MainActionButton
          label="Redeem"
          disabled={
            inputAmount.isZero() ||
            inputAmount.gte(balances[0].allowance) ||
            balances[0].allowance.lte(constants.Zero) ||
            balances[0].allowance.lt(inputAmount)
          }
          handleClick={() => {
            redeem(inputAmount).then((res) => {
              setInputAmount(BigNumber.from(0));
            });
          }}
        />
      </div>
    </div>
  );
};
export default AirDropClaim;
