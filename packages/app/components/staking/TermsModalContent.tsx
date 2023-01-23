import MainActionButton from "@popcorn/app/components/MainActionButton";
import { useState } from "react";

interface TermsContentProps {
  restake: () => void;
}
const TermsContent: React.FC<TermsContentProps> = ({ restake }) => {
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  return (
    <div>
      <div className="flex items-center">
        <input
          name="acceptTerms"
          id="acceptTerms"
          type="checkbox"
          checked={termsAccepted}
          onChange={() => {
            setTermsAccepted(!termsAccepted);
          }}
          className="ml-1 mr-4 focus:ring-primary h-4 w-4 text-primary border-customLightGray rounded"
        />
        <label className="text-left text-primaryDark text-base" htmlFor="acceptTerms">
          Accept reward terms and conditions:
        </label>
      </div>
      <ol className="pl-12 mt-5 mb-10 list-decimal space-y-4 text-left">
        <li className="text-primaryDark">
          Your staked tokens will be locked for a period of 12 weeks. You will be unable to access your tokens during
          this period.
        </li>
        <li className="text-primaryDark">
          {" "}
          Your staked tokens must be re-staked or withdrawn after the 3-month lock time expires or they will be
          subjected to a penalty of 1% per epoch week that they are not re-staked.
        </li>
        <li className="text-primaryDark">
          After rewards are earned and claimed, 10% is immediately transferred, and the rest of the earned amount is
          unlocked linearly over the following 365 day period.
        </li>
      </ol>
      <MainActionButton label="Stake" handleClick={restake} disabled={!termsAccepted} />
    </div>
  );
};

export default TermsContent;
