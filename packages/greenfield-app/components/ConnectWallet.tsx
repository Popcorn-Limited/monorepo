import SecondaryActionButton from "@popcorn/greenfield-app/components/SecondaryActionButton";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export const ConnectWallet = ({ hidden }: { hidden?: boolean }) => {
  const { openConnectModal } = useConnectModal();

  return (
    <div
      className={`rounded-lg md:border md:border-customLightGray px-0 pt-4 md:p-6 md:pb-0 group cursor-pointer ${
        hidden ? "hidden" : ""
      }`}
      onClick={openConnectModal}
    >
      <p className="text-gray-900 text-3xl leading-8 hidden md:block">Connect your wallet</p>
      <div className="border md:border-0 md:border-t border-customLightGray rounded-lg md:rounded-none px-6 md:px-0  py-6 md:py-2 md:mt-4">
        <div className="hidden md:block">
          <SecondaryActionButton label="Connect" />
        </div>
        <div className="md:hidden">
          <SecondaryActionButton label="Connect Wallet" />
        </div>
      </div>
    </div>
  );
};
