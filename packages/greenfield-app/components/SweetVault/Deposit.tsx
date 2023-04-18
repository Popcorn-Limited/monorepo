import AssetInputWithAction from "@popcorn/components/components/AssetInputWithAction";
import FeeBreakdown from "./FeeBreakdown";
import { useAllowance } from "@popcorn/components/lib/Erc20/hooks";
import { Address, useAccount } from "wagmi";
import { useNamedAccounts } from "@popcorn/components/lib/utils";
import { BigNumber, constants } from "ethers";
import TokenIcon from "@popcorn/components/components/TokenIcon";

function Deposit({
  vault,
  asset,
  chainId,
  staking,
  pps,
  getTokenUrl,
  children
}: {
  vault: string;
  asset: string;
  chainId: any;
  staking: string;
  pps: number;
  getTokenUrl?: string;
  children: React.ReactElement
}) {
  const usesStaking = staking?.toLowerCase() !== constants.AddressZero.toLowerCase();
  const { address: account } = useAccount();
  const [router] = useNamedAccounts(chainId, ["vaultRouter"]);

  const { data: allowance } = useAllowance({ address: asset, account: (usesStaking ? router?.address : vault) as Address, chainId });

  // dont show this for testing
  if (getTokenUrl === "https://curve.fi/") getTokenUrl = undefined

  return (
    <div className="flex flex-col">
      <AssetInputWithAction
        assetAddress={asset}
        target={(usesStaking ? router?.address : vault) as string}
        chainId={chainId}
        action={(balance) => {
          return {
            label: "Deposit",
            abi: ["function depositAndStake(address vault, uint256 assetAmount, address receiver) external", "function deposit(uint256 assetAmount) external"],
            functionName: usesStaking ? "depositAndStake" : "deposit",
            successMessage: "Deposit successful!",
            args: usesStaking ? [vault, balance, account] : [balance],
          };
        }}
        allowance={allowance?.value}
        // Show the correct link for this vault for testing
        getTokenUrl={vault === "0xb4bA0B340a1Ab76d3d92a66123390599743E314d" ? "https://app.hop.exchange/#/pool/deposit?token=USDC&sourceNetwork=optimism" : getTokenUrl}
      >
        {({ ActionableComponent, data }) => {
          return (
            <>
              {children}
              <p className="text-primary">Estimated Shares</p>
              <div className="mt-1 relative flex items-center w-full">
                <div
                  className={`w-full flex px-5 py-4 items-center justify-between rounded-lg border border-customLightGray`}
                >
                  <p className="text-primaryDark text-lg leading-snug p-0">{(data.balance.formatted / pps) / 1e9}</p>
                  <TokenIcon token={vault} imageSize="w-5 h-5" chainId={chainId} />
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

export default Deposit;