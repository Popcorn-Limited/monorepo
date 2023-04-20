import { Address, useAccount } from "wagmi";
import { constants } from "ethers";
import { useNamedAccounts } from "@popcorn/greenfield-app/lib/utils";
import AssetInputWithAction from "components/AssetInputWithAction";
import FeeBreakdown from "./FeeBreakdown";
import { useAllowance } from "@popcorn/greenfield-app/lib/Erc20/hooks";
import TokenIcon from "@popcorn/greenfield-app/components/TokenIcon";

function Withdraw({
  vault,
  chainId,
  asset,
  staking,
  pps,
  children
}: {
  vault: string;
  asset: string;
  chainId: any;
  staking: string;
  pps: number;
  children: React.ReactElement
}) {
  const usesStaking = staking?.toLowerCase() !== constants.AddressZero.toLowerCase();
  const [router] = useNamedAccounts(chainId, ["vaultRouter"]);
  const { address: account } = useAccount();

  const { data: allowance } = useAllowance({ address: staking, account: router.address as Address, chainId });

  return (
    <div className="flex flex-col">
      <AssetInputWithAction
        assetAddress={(usesStaking ? staking : vault)}
        target={(usesStaking ? router.address : vault) as string}
        chainId={chainId}
        action={(balance) => {
          return {
            label: "Withdraw",
            abi: [
              "function redeemAndWithdraw(address vault, uint256 burnAmount, address receiver, address owner) external",
              "function redeem(uint256 burnAmount) external"
            ],
            functionName: usesStaking ? "redeemAndWithdraw" : "redeem",
            successMessage: "Withdraw successful!",
            args: usesStaking ? [vault, balance, account, account] : [balance],
          };
        }}
        allowance={usesStaking ? allowance?.value : constants.MaxUint256}
      >
        {({ ActionableComponent, data }) => {
          return (
            <>
              {children}
              <p className="text-primary">Estimated Assets</p>
              <div className="mt-1 relative flex items-center w-full">
                <div
                  className={`w-full flex px-5 py-4 items-center justify-between rounded-lg border border-customLightGray`}
                >
                  <p className="text-primaryDark text-lg leading-snug p-0">{(data.balance.formatted * pps) * 1e9}</p>
                  <TokenIcon token={asset} imageSize="w-5 h-5" chainId={chainId} />
                </div>
              </div>
              <FeeBreakdown vault={vault} />
              <ActionableComponent />
            </>);
        }}
      </AssetInputWithAction>
    </div>
  );
}

export default Withdraw;

