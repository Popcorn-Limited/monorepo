import { Address, useAccount } from "wagmi";
import { constants } from "ethers";
import { useNamedAccounts } from "@popcorn/components/lib/utils";
import AssetInputWithAction from "@popcorn/components/components/AssetInputWithAction";
import FeeBreakdown from "./FeeBreakdown";
import { useAllowance } from "@popcorn/components/lib/Erc20/hooks";

function Withdraw({
  vault,
  chainId,
  asset,
  staking
}: {
  vault: string;
  asset: string;
  chainId: any;
  staking: string;
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
        {({ ActionableComponent }) => {
          return (
            <>
              <FeeBreakdown vault={vault} />
              <ActionableComponent />
            </>);
        }}
      </AssetInputWithAction>
    </div>
  );
}

export default Withdraw;

