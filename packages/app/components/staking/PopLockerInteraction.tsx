import { formatAndRoundBigNumber } from "@popcorn/utils";
import TokenInput from "@popcorn/app/components/Common/TokenInput";
import MainActionButton from "@popcorn/app/components/MainActionButton";
import VestingRecordDropDown from "@popcorn/app/components/staking/VestingRecordDropDown";
import TermsAndConditions from "@popcorn/app/components/StakingTermsAndConditions";
import { useEffect, useState } from "react";
import { formatDate } from "@popcorn/utils/src/DateTime";
import { InteractionType } from "@popcorn/app/components/staking/StakeInterface";
import { StakingInteractionProps } from "@popcorn/app/components/staking/StakingInteraction";
import { Pop } from "@popcorn/components/lib/types";
import { BigNumber } from "ethers";

interface PopLockerInteractionProps extends StakingInteractionProps {
  restake: () => void;
  spendableBalance?: Pop.HookResult<BigNumber>;
}

export default function PopLockerInteraction({
  stakingPool,
  user,
  form,
  onlyView,
  approve,
  stake,
  withdraw,
  restake,
  chainId,
  account,
  spendableBalance,
}: PopLockerInteractionProps): JSX.Element {
  const [state, setState] = form;
  const { type, amount, termsAccepted } = { ...state };
  const withdrawal = type === InteractionType.Withdraw;
  const deposit = type === InteractionType.Deposit;
  const stakingToken = stakingPool?.stakingToken;
  const lockedBalances = stakingPool?.lockedBalances;
  const [chosenLock, setChosenLock] = useState(lockedBalances[0]);

  useEffect(() => {
    if (lockedBalances.length > 0) {
      setChosenLock(lockedBalances[0]);
    }
  }, [lockedBalances]);

  return (
    <>
      {withdrawal && (
        <div className="pt-10 mx-auto">
          <div className="w-full mb-10">
            {/* check if lockedBalances[0] is not undefined */}
            {lockedBalances?.length && lockedBalances[0].unlockTime ? (
              <VestingRecordDropDown
                label={"Stake Records"}
                options={lockedBalances}
                selectOption={setChosenLock}
                selectedOption={chosenLock}
              />
            ) : (
              <></>
            )}
            {chosenLock && (
              <div className="flex flex-row flex-wrap lglaptop:justify-between -mr-2 justify-center my-10">
                <div className="bg-gray-50 p-4 mb-2 flex-col rounded-2xl mr-2 max-w-1/2 flex-1 lglaptop:w-fit">
                  <p className="text-gray-500">AMOUNT</p>
                  <p className="text-gray-900 text-lg font-semibold">
                    {formatAndRoundBigNumber(chosenLock.amount, 18)} POP
                  </p>
                </div>
                <div className="bg-gray-50 p-4 mb-2 flex-col rounded-2xl mr-2 max-w-1/2 flex-1 lglaptop:w-fit">
                  <p className="text-gray-500 whitespace-nowrap">UNLOCK DATE</p>
                  <p className="text-gray-900 text-lg font-semibold">
                    {formatDate(new Date(chosenLock.unlockTime * 1000), "MMM dd")}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 mb-2 flex-col rounded-2xl mr-2 lglaptopt:mt-0 max-w-1/2 flex-1 lglaptop:w-fit">
                  <p className="text-gray-500">REMAINING</p>
                  <p className="text-gray-900 text-lg font-semibold">
                    {Math.floor((chosenLock.unlockTime * 1000 - Date.now()) / (60 * 60 * 24 * 7) / 1000)} Weeks
                  </p>
                </div>
              </div>
            )}
            <label
              htmlFor="tokenInput"
              className="flex justify-between text-sm font-medium text-gray-700 text-center mt-6"
            >
              <p className="mb-2 text-gray-900 text-base font-semibold">Withdrawable Amount</p>
            </label>
            <div className="relative flex items-center">
              <input
                type="string"
                name="tokenInput"
                id="tokenInput"
                className="shadow-sm block w-full pl-4 pr-16 py-4 text-lg border-gray-300 bg-gray-100 rounded-xl"
                value={formatAndRoundBigNumber(stakingPool?.withdrawable, stakingPool.stakingToken.decimals)}
                disabled
              />
              <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                <p className="inline-flex items-center  font-medium text-lg mx-3">POP</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-0 md:space-x-4">
            <MainActionButton
              label={"Restake POP"}
              handleClick={restake}
              disabled={onlyView || stakingPool?.withdrawable.isZero()}
            />
            <MainActionButton
              label={"Withdraw POP"}
              handleClick={withdraw}
              disabled={onlyView || stakingPool?.withdrawable.isZero()}
            />
          </div>
        </div>
      )}
      {deposit && (
        <>
          <div className="pt-16 pb-10">
            <TokenInput
              chainId={chainId}
              label={withdrawal ? "Unstake Amount" : "Stake Amount"}
              token={stakingPool?.stakingToken}
              amount={amount}
              account={account}
              balance={user.balance}
              spendableBalance={spendableBalance}
              setAmount={(_amount) => {
                setState({ ...state, amount: _amount });
              }}
            />
          </div>
          <TermsAndConditions
            isDisabled={onlyView}
            termsAccepted={termsAccepted}
            setTermsAccepted={(accepted) => setState({ ...state, termsAccepted: accepted })}
            showLockTerms
          />
          {user && amount.lt(user.allowance) ? (
            <div className="mx-auto pt-2 pb-6 bottom-0">
              <MainActionButton
                label={`Stake ${stakingToken?.symbol}`}
                handleClick={stake}
                disabled={onlyView || !termsAccepted || amount.isZero() || user.balance.isZero()}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <MainActionButton
                label={"Approve for Staking"}
                handleClick={approve}
                disabled={onlyView || amount.isZero()}
              />
              <MainActionButton
                label={`Stake ${stakingToken?.symbol}`}
                handleClick={stake}
                disabled={onlyView || !termsAccepted || !amount.lt(user.allowance)}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
