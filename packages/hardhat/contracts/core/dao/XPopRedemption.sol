// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IXPop.sol";
import "../interfaces/IRewardsEscrow.sol";

/**
 *  @notice This contract allows users to redeem xPOP tokens for escrowed POP. Redeemed xPOP tokens
 *          are burned in exchange for POP tokens escrowed for 365 days.
 */
contract XPopRedemption is Ownable {
  using SafeERC20 for IXPop;
  using SafeERC20 for IERC20;

  IXPop public immutable xPOP;
  IERC20 public immutable POP;
  IRewardsEscrow public immutable rewardsEscrow;

  event Redemption(address indexed from, uint256 amount);

  constructor(
    IXPop _xPOP,
    IERC20 _POP,
    IRewardsEscrow _rewardsEscrow
  ) {
    xPOP = _xPOP;
    POP = _POP;
    rewardsEscrow = _rewardsEscrow;
  }

  /**
   *  @notice Redeem xPOP for escrowed POP. Redeemed xPOP will be burned. POP tokens
   *          will be escrowed for 365 days.
   *  @param amount Amount of xPOP token to redeem
   */
  function redeem(uint256 amount) external {
    _redeem(amount);
  }

  function redeemWithSignature(
    uint256 amount,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external {
    xPOP.permit(msg.sender, address(this), amount, deadline, v, r, s);
    _redeem(amount);
  }

  /**
   *  @notice Approve maximum amount of POP to rewards escrow. Must be contract owner.
   */
  function setApprovals() external onlyOwner {
    _revokeApprovals();
    POP.safeApprove(address(rewardsEscrow), type(uint256).max);
  }

  /**
   *  @notice Revoke POP approval to rewards escrow. Must be contract owner.
   */
  function revokeApprovals() external onlyOwner {
    _revokeApprovals();
  }

  function _revokeApprovals() internal {
    POP.safeApprove(address(rewardsEscrow), 0);
  }

  function _redeem(uint256 amount) internal {
    require(POP.balanceOf(address(this)) >= amount, "Insufficient POP balance");
    xPOP.burnFrom(msg.sender, amount);
    rewardsEscrow.lock(msg.sender, amount, 365 days * 2);
    emit Redemption(msg.sender, amount);
  }
}
