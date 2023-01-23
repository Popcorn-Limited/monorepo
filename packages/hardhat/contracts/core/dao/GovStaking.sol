// SPDX-License-Identifier: MIT

// Docgen-SOLC: 0.8.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IGovStaking.sol";
import "../interfaces/IRewardsManager.sol";
import "../interfaces/IRewardsEscrow.sol";
import "../interfaces/IACLRegistry.sol";
import "../interfaces/IContractRegistry.sol";

contract GovStaking is IGovStaking, ReentrancyGuard, Ownable {
  using SafeERC20 for IERC20;

  struct LockedBalance {
    uint256 balance;
    uint256 end;
  }

  /* ========== STATE VARIABLES ========== */

  IContractRegistry public contractRegistry;

  uint256 public periodFinish = 0;
  uint256 public rewardRate = 0;
  uint256 public rewardsDuration = 7 days;
  uint256 public lastUpdateTime;
  uint256 public rewardPerTokenStored;
  uint256 public totalLocked;
  uint256 public totalVoiceCredits;
  uint256 public escrowDuration = 365 days;
  mapping(address => uint256) public voiceCredits;
  mapping(address => uint256) public userRewardPerTokenPaid;
  mapping(address => uint256) public rewards;
  mapping(address => LockedBalance) public lockedBalances;

  /* ========== EVENTS ========== */

  event StakingDeposited(address _address, uint256 amount);
  event StakingWithdrawn(address _address, uint256 amount);
  event RewardPaid(address _address, uint256 reward);
  event RewardAdded(uint256 reward);
  event EscrowDurationUpdated(uint256 _previousDuration, uint256 _newDuration);

  /* ========== CONSTRUCTOR ========== */

  constructor(IContractRegistry _contractRegistry) {
    contractRegistry = _contractRegistry;
  }

  /* ========== VIEWS ========== */

  /**
   * @notice this returns the current voice credit balance of an address. voice credits decays over time. the amount returned is up to date, whereas the amount stored in `public voiceCredits` is saved only during some checkpoints.
   * @dev todo - check if multiplier is needed for calculating square root of smaller balances
   * @param _address address to get voice credits for
   */
  function getVoiceCredits(address _address) public view override returns (uint256) {
    uint256 lockEndTime = lockedBalances[_address].end;
    uint256 balance = lockedBalances[_address].balance;
    uint256 currentTime = block.timestamp;

    if (lockEndTime == 0 || lockEndTime < currentTime || balance == 0) {
      return 0;
    }

    uint256 timeTillEnd = ((lockEndTime - currentTime) / 1 hours) * 1 hours;
    return (balance * timeTillEnd) / (4 * 365 days);
  }

  function getWithdrawableBalance(address _address) public view override returns (uint256) {
    uint256 withdrawable = 0;
    if (lockedBalances[_address].end <= block.timestamp) {
      withdrawable = lockedBalances[_address].balance;
    }
    return withdrawable;
  }

  function balanceOf(address _address) external view override returns (uint256) {
    return lockedBalances[_address].balance;
  }

  function lastTimeRewardApplicable() public view returns (uint256) {
    return Math.min(block.timestamp, periodFinish);
  }

  function rewardPerToken() public view returns (uint256) {
    if (totalLocked == 0) {
      return rewardPerTokenStored;
    }
    return rewardPerTokenStored + (((lastTimeRewardApplicable() - lastUpdateTime) * rewardRate * 1e18) / totalLocked);
  }

  function earned(address _account) public view returns (uint256) {
    return
      (lockedBalances[_account].balance * (rewardPerToken() - userRewardPerTokenPaid[_account])) /
      1e18 +
      rewards[_account];
  }

  function getRewardForDuration() external view returns (uint256) {
    return rewardRate * rewardsDuration;
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  function stake(uint256 _amount, uint256 _lengthOfTime) external override nonReentrant updateReward(msg.sender) {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry"))).requireApprovedContractOrEOA(msg.sender);
    IERC20 POP = IERC20(contractRegistry.getContract(keccak256("POP")));
    require(_amount > 0, "amount must be greater than 0");
    require(_lengthOfTime >= 7 days, "must lock tokens for at least 1 week");
    require(_lengthOfTime <= 365 * 4 days, "must lock tokens for less than/equal to  4 year");
    require(POP.balanceOf(msg.sender) >= _amount, "insufficient balance");
    require(lockedBalances[msg.sender].balance == 0, "withdraw balance first");

    POP.safeTransferFrom(msg.sender, address(this), _amount);

    totalLocked = totalLocked + _amount;
    _lockTokens(_amount, _lengthOfTime);
    recalculateVoiceCredits(msg.sender);
    emit StakingDeposited(msg.sender, _amount);
  }

  function increaseLock(uint256 _lengthOfTime) external {
    require(_lengthOfTime >= 7 days, "must lock tokens for at least 1 week");
    require(_lengthOfTime <= 365 * 4 days, "must lock tokens for less than/equal to  4 year");
    require(lockedBalances[msg.sender].balance > 0, "no lockedBalance exists");
    require(lockedBalances[msg.sender].end > block.timestamp, "withdraw balance first");
    lockedBalances[msg.sender].end = lockedBalances[msg.sender].end + _lengthOfTime;
    recalculateVoiceCredits(msg.sender);
  }

  function increaseStake(uint256 _amount) external {
    IERC20 POP = IERC20(contractRegistry.getContract(keccak256("POP")));
    require(_amount > 0, "amount must be greater than 0");
    require(POP.balanceOf(msg.sender) >= _amount, "insufficient balance");
    require(lockedBalances[msg.sender].balance > 0, "no lockedBalance exists");
    require(lockedBalances[msg.sender].end > block.timestamp, "withdraw balance first");
    POP.safeTransferFrom(msg.sender, address(this), _amount);
    totalLocked = totalLocked + _amount;
    lockedBalances[msg.sender].balance = lockedBalances[msg.sender].balance + _amount;
    recalculateVoiceCredits(msg.sender);
  }

  function withdraw(uint256 _amount) public override nonReentrant updateReward(msg.sender) {
    require(_amount > 0, "amount must be greater than 0");
    require(lockedBalances[msg.sender].balance > 0, "insufficient balance");
    require(_amount <= getWithdrawableBalance(msg.sender));

    IERC20(contractRegistry.getContract(keccak256("POP"))).safeTransfer(msg.sender, _amount);

    totalLocked = totalLocked - _amount;
    _clearWithdrawnFromLocked(_amount);
    recalculateVoiceCredits(msg.sender);
    emit StakingWithdrawn(msg.sender, _amount);
  }

  function getReward() public nonReentrant updateReward(msg.sender) {
    uint256 reward = rewards[msg.sender];
    if (reward > 0) {
      rewards[msg.sender] = 0;
      //How to handle missing gwei?
      uint256 payout = reward / uint256(3);
      uint256 escrowed = payout * uint256(2);

      IERC20 POP = IERC20(contractRegistry.getContract(keccak256("POP")));
      address rewardsEscrow = contractRegistry.getContract(keccak256("RewardsEscrow"));

      POP.safeTransfer(msg.sender, payout);
      POP.safeIncreaseAllowance(rewardsEscrow, escrowed);
      IRewardsEscrow(rewardsEscrow).lock(msg.sender, escrowed, escrowDuration);

      emit RewardPaid(msg.sender, payout);
    }
  }

  function exit() external {
    withdraw(getWithdrawableBalance(msg.sender));
    getReward();
  }

  /* ========== RESTRICTED FUNCTIONS ========== */

  // todo: multiply voice credits by 10000 to deal with exponent math- is it needed?
  function recalculateVoiceCredits(address _address) public {
    uint256 previousVoiceCredits = voiceCredits[_address];
    totalVoiceCredits = totalVoiceCredits - previousVoiceCredits;
    voiceCredits[_address] = getVoiceCredits(_address);
    totalVoiceCredits = totalVoiceCredits + voiceCredits[_address];
  }

  function _lockTokens(uint256 _amount, uint256 _lengthOfTime) internal {
    uint256 currentTime = block.timestamp;
    if (currentTime > lockedBalances[msg.sender].end) {
      lockedBalances[msg.sender] = LockedBalance({
        balance: lockedBalances[msg.sender].balance + _amount,
        end: currentTime + _lengthOfTime
      });
    } else {
      lockedBalances[msg.sender] = LockedBalance({
        balance: lockedBalances[msg.sender].balance + _amount,
        end: lockedBalances[msg.sender].end + _lengthOfTime
      });
    }
  }

  function _clearWithdrawnFromLocked(uint256 _amount) internal {
    if (lockedBalances[msg.sender].end <= block.timestamp) {
      if (_amount == lockedBalances[msg.sender].balance) {
        delete lockedBalances[msg.sender];
      } else {
        lockedBalances[msg.sender].balance = lockedBalances[msg.sender].balance - _amount;
      }
    }
  }

  function setEscrowDuration(uint256 duration) external onlyOwner {
    emit EscrowDurationUpdated(escrowDuration, duration);
    escrowDuration = duration;
  }

  function notifyRewardAmount(uint256 _reward) external override updateReward(address(0)) {
    require(
      msg.sender == contractRegistry.getContract(keccak256("RewardsManager")) ||
        IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry"))).hasRole(keccak256("DAO"), msg.sender),
      "Not allowed"
    );
    IERC20(contractRegistry.getContract(keccak256("POP"))).safeTransferFrom(msg.sender, address(this), _reward);

    if (block.timestamp >= periodFinish) {
      rewardRate = _reward / rewardsDuration;
    } else {
      uint256 remaining = periodFinish - block.timestamp;
      uint256 leftover = remaining * rewardRate;
      rewardRate = (_reward + leftover) / rewardsDuration;
    }

    // Ensure the provided reward amount is not more than the balance in the contract.
    // This keeps the reward rate in the right range, preventing overflows due to
    // very high values of rewardRate in the earned and rewardsPerToken functions;
    // Reward + leftover must be less than 2^256 / 10^18 to avoid overflow.
    uint256 balance = IERC20(contractRegistry.getContract(keccak256("POP"))).balanceOf(address(this));
    require(rewardRate <= (balance / rewardsDuration), "Provided reward too high");

    lastUpdateTime = block.timestamp;
    periodFinish = block.timestamp + rewardsDuration;
    emit RewardAdded(_reward);
  }

  // End rewards emission earlier
  function updatePeriodFinish(uint256 _timestamp) external updateReward(address(0)) {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry"))).requireRole(keccak256("DAO"), msg.sender);
    require(_timestamp > block.timestamp, "timestamp cant be in the past");
    periodFinish = _timestamp;
  }

  /* ========== MODIFIERS ========== */

  modifier updateReward(address _account) {
    rewardPerTokenStored = rewardPerToken();
    lastUpdateTime = lastTimeRewardApplicable();
    if (_account != address(0)) {
      rewards[_account] = earned(_account);
      userRewardPerTokenPaid[_account] = rewardPerTokenStored;
    }
    _;
  }
}
