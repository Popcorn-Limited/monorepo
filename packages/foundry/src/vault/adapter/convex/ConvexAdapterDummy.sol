// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.8.10;

import { ERC20, ERC4626 } from "solmate/mixins/ERC4626.sol";
import { SafeTransferLib } from "solmate/utils/SafeTransferLib.sol";

/// @title Rewards Claiming Contract
/// @author joeysantoro
contract RewardsClaimer {
  using SafeTransferLib for ERC20;

  event RewardDestinationUpdate(address indexed newDestination);

  event ClaimRewards(address indexed rewardToken, uint256 amount);

  /// @notice the address to send rewards
  address public rewardDestination;

  /// @notice the array of reward tokens to send to
  ERC20[] public rewardTokens;

  constructor(address _rewardDestination, ERC20[] memory _rewardTokens) {
    rewardDestination = _rewardDestination;
    rewardTokens = _rewardTokens;
  }

  /// @notice claim all token rewards
  function claimRewards() public {
    beforeClaim(); // hook to accrue/pull in rewards, if needed

    uint256 len = rewardTokens.length;
    // send all tokens to destination
    for (uint256 i = 0; i < len; i++) {
      ERC20 token = rewardTokens[i];
      uint256 amount = token.balanceOf(address(this));

      token.safeTransfer(rewardDestination, amount);

      emit ClaimRewards(address(token), amount);
    }
  }

  /// @notice set the address of the new reward destination
  /// @param newDestination the new reward destination
  function setRewardDestination(address newDestination) external {
    require(msg.sender == rewardDestination, "UNAUTHORIZED");
    rewardDestination = newDestination;
    emit RewardDestinationUpdate(newDestination);
  }

  /// @notice hook to accrue/pull in rewards, if needed
  function beforeClaim() internal virtual {}
}

// Docs: https://docs.convexfinance.com/convexfinanceintegration/booster

// main Convex contract(booster.sol) basic interface
interface IConvexBooster {
  // deposit into convex, receive a tokenized deposit. parameter to stake immediately
  function deposit(
    uint256 _pid,
    uint256 _amount,
    bool _stake
  ) external returns (bool);
}

interface IConvexBaseRewardPool {
  function pid() external view returns (uint256);

  function withdrawAndUnwrap(uint256 amount, bool claim) external returns (bool);

  function getReward(address _account, bool _claimExtras) external returns (bool);

  function balanceOf(address account) external view returns (uint256);

  function extraRewards(uint256 index) external view returns (IRewards);

  function extraRewardsLength() external view returns (uint256);

  function rewardToken() external view returns (ERC20);
}

interface IRewards {
  function rewardToken() external view returns (ERC20);
}

/// @title Convex Finance Yield Bearing Vault
/// @author joeysantoro
contract ConvexERC4626 is ERC4626, RewardsClaimer {
  using SafeTransferLib for ERC20;

  /// @notice The Convex Booster contract (for deposit/withdraw)
  IConvexBooster public immutable convexBooster;

  /// @notice The Convex Rewards contract (for claiming rewards)
  IConvexBaseRewardPool public immutable convexRewards;

  /// @notice Convex token
  ERC20 CVX = ERC20(0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B);

  uint256 public immutable pid;

  /**
     @notice Creates a new Vault that accepts a specific underlying token.
     @param _asset The ERC20 compliant token the Vault should accept.
     @param _name The name for the vault token.
     @param _symbol The symbol for the vault token.
     @param _convexBooster The Convex Booster contract (for deposit/withdraw).
     @param _convexRewards The Convex Rewards contract (for claiming rewards).
     @param _rewardsDestination the address to send CRV and CVX.
     @param _rewardTokens the rewards tokens to send out.
    */
  constructor(
    ERC20 _asset,
    string memory _name,
    string memory _symbol,
    IConvexBooster _convexBooster,
    IConvexBaseRewardPool _convexRewards,
    address _rewardsDestination,
    ERC20[] memory _rewardTokens
  ) ERC4626(_asset, _name, _symbol) RewardsClaimer(_rewardsDestination, _rewardTokens) {
    convexBooster = _convexBooster;
    convexRewards = _convexRewards;

    pid = _convexRewards.pid();

    _asset.approve(address(_convexBooster), type(uint256).max);
  }

  function updateRewardTokens() public {
    uint256 len = convexRewards.extraRewardsLength();
    require(len < 5, "exceed max rewards");
    delete rewardTokens;
    bool cvxReward;

    for (uint256 i = 0; i < len; i++) {
      rewardTokens.push(convexRewards.extraRewards(i).rewardToken());
      if (convexRewards.extraRewards(i).rewardToken() == CVX) cvxReward = true;
    }
    if (!cvxReward) rewardTokens.push(CVX);
    rewardTokens.push(convexRewards.rewardToken());
  }

  function afterDeposit(uint256 amount, uint256) internal override {
    require(convexBooster.deposit(pid, amount, true), "deposit error");
  }

  function beforeWithdraw(uint256 amount, uint256) internal override {
    require(convexRewards.withdrawAndUnwrap(amount, false), "withdraw error");
  }

  function beforeClaim() internal override {
    require(convexRewards.getReward(address(this), true), "rewards error");
  }

  /// @notice Calculates the total amount of underlying tokens the Vault holds.
  /// @return The total amount of underlying tokens the Vault holds.
  function totalAssets() public view override returns (uint256) {
    return convexRewards.balanceOf(address(this));
  }
}
