import { Dispatch } from "react";

interface TermsAndConditionsProps {
  isDisabled: boolean;
  termsAccepted: boolean;
  setTermsAccepted: Dispatch<boolean>;
  showLockTerms?: boolean;
}

const TermsAndConditions = ({
  isDisabled,
  termsAccepted,
  setTermsAccepted,
  showLockTerms = false,
}: TermsAndConditionsProps) => {
  return (
    <div>
      <div className="relative flex items-start pb-10">
        <div className="flex items-center h-5 pt-2">
          {isDisabled ? (
            <input
              type="checkbox"
              disabled
              className="mr-4 focus:ring-gray-500 h-5 w-5 text-primaryDark border-customLightGray rounded"
              readOnly
            />
          ) : (
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={() => {
                setTermsAccepted(!termsAccepted);
              }}
              className="mr-4 focus:ring-blue-500 h-5 w-5 text-blue-600 border-customLightGray rounded"
            />
          )}
        </div>
        <div className="">
          <p className={` ${isDisabled ? "text-customLightGray" : "text-primaryDark"} pb-2`}>
            Accept reward terms and conditions:
          </p>
          <ol className="space-y-4">
            {showLockTerms && (
              <>
                <li className={` leading-6 ${isDisabled ? "text-customLightGray" : "text-primaryDark"}`}>
                  Your staked tokens will be locked for a period of 12 weeks. You will be unable to access your tokens
                  during this period.
                </li>
                <li className={` leading-6 ${isDisabled ? "text-customLightGray" : "text-primaryDark"}`}>
                  Your staked tokens must be re-staked or withdrawn after the 3-month lock time expires or they will be
                  subjected to a penalty of 1% per epoch that they are not re-staked.
                </li>
              </>
            )}
            <li className={` leading-6 ${isDisabled ? "text-customLightGray" : "text-primaryDark"}`}>
              After rewards are earned and claimed, 10% is immediately transferred, and the rest of the earned amount is
              unlocked linearly over the following 365 day period.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
export default TermsAndConditions;
