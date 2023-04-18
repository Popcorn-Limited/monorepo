import { ChainId } from "@popcorn/utils";
import * as Icon from "react-feather";
import { useNamedAccounts } from "@popcorn/components/lib/utils";
import AssetInputWithAction from "@popcorn/components/components/AssetInputWithAction";
import { Address, useAccount } from "wagmi";
import TokenIcon from "@popcorn/components/components/TokenIcon";
import { useAllowance } from "@popcorn/components/lib/Erc20/hooks";

interface AirDropClaimProps {
  chainId: ChainId;
}

const AirDropClaim: React.FC<AirDropClaimProps> = ({ chainId }) => {
  const { address: account } = useAccount();
  const [pop, xPop, xPopRedemption] = useNamedAccounts(chainId as any, ["pop", "xPop", "xPopRedemption"]);
  const { data: allowance } = useAllowance({ address: xPop?.address, account: xPopRedemption?.address as Address, chainId });

  return (
    <div className="bg-white rounded-3xl px-5 pt-14 pb-6 border border-gray-200 shadow-custom">
      <div className="flex flex-col justify-between items-start w-full">
        <AssetInputWithAction
          assetAddress={xPop?.address}
          target={xPopRedemption?.address}
          chainId={chainId}
          action={{
            label: "Redeem",
            abi: ["function redeem(uint256 amount) external"],
            functionName: "redeem",
            successMessage: "Redemption successful!",
          }}
          allowance={allowance?.value}
        >
          {({ ActionableComponent, data }) => {
            return (
              <>
                <div className="w-full relative mt-4 mb-2">
                  <div className={`relative flex justify-center`}>
                    <div className="w-20 bg-white">
                      <div className="flex items-center justify-center w-14 h-14 mx-auto border border-gray-300 rounded-full cursor-pointer">
                        <Icon.ArrowDown height={24} width={24} strokeWidth={1.5} color="gray" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full mt-6">
                  <div
                    className={`w-full flex flex-row justify-between px-5 py-4 items-center rounded-lg border border-customLightGray `}
                  >
                    <p>{data.balance.formatted}</p>
                    <TokenIcon token={pop?.address} imageSize="w-5 h-5" chainId={chainId} />
                  </div>
                </div>
                <div className="w-full text-center mt-10 space-y-4">
                  <ActionableComponent />
                </div>
              </>
            );
          }}
        </AssetInputWithAction>
      </div>
    </div>
  );
};
export default AirDropClaim;
