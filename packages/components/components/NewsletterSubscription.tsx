import SecondaryButton from "@popcorn/components/components/SecondaryActionButton";
import useSubscribeToNewsletter from "@popcorn/components/hooks/useSubscribeToNewsletter";
import React, { useState } from "react";

interface NewsletterSubscriptionProps {
  title: string;
  buttonLabel: string;
}

const NewsletterSubscription = ({ title, buttonLabel }: NewsletterSubscriptionProps) => {
  const [subscribeEmail, setSubscribeEmail] = useState<string>("");
  const { subscribeToNewsLetter, subscribing, subscriptionSuccessful } = useSubscribeToNewsletter();

  const subscribe = () => {
    subscribeToNewsLetter({
      email: subscribeEmail,
      onSuccess: () => {
        setSubscribeEmail("");
      },
    });
  };

  const onEnterKey = (e) => {
    if (e.key === "Enter") {
      subscribe();
    }
  };

  return (
    <div className="validate mt-12">
      <h6 className="px-1 leading-6">{title}</h6>
      <input
        type="email"
        name="EMAIL"
        id="mce-EMAIL"
        className=" border-x-0 border-y-customLightGray text-primaryLight placeholder-primaryLight px-1 py-2 w-full mt-2 leading-7"
        placeholder="Enter your email"
        onChange={(e) => setSubscribeEmail(e.target.value)}
        value={subscribeEmail}
        onKeyUp={onEnterKey}
      />
      <div style={{ position: "absolute", left: "-5000px" }} aria-hidden="true">
        <input type="text" name="b_5ce5e82d673fd2cfaf12849a5_e85a091ed3" tabIndex={-1} />
      </div>
      <div className={`${subscriptionSuccessful ? "" : "px-1 py-4"} border-b border-customLightGray relative`}>
        {subscribing && (
          <div className="flex items-center justify-between">
            <p>Submitting...</p> <div className="spinner"></div>
          </div>
        )}
        {subscriptionSuccessful && (
          <div className="bg-customYellow py-2 px-1">
            <p className="font-medium">Subscribed Successfully!</p>
          </div>
        )}
        {!subscribing && !subscriptionSuccessful && <SecondaryButton label={buttonLabel} handleClick={subscribe} />}
      </div>
    </div>
  );
};

export default NewsletterSubscription;
