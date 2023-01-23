// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.10

pragma solidity ^0.8.10;

// Inheritance
import "../utils/Owned.sol";
import "../interfaces/IRewardsDistribution.sol";
import "../utils/KeeperIncentivized.sol";
import "../utils/ContractRegistryAccess.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// Libraires
import "../libraries/SafeDecimalMath.sol";

// Internal references
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IContractRegistry.sol";
import "../interfaces/IKeeperIncentiveV2.sol";

error DistributionFailed(address destination, uint256 amount);

// https://docs.synthetix.io/contracts/source/contracts/rewardsdistribution
contract RewardsDistribution is Owned, KeeperIncentivized, ContractRegistryAccess, IRewardsDistribution {
  using SafeMath for uint256;
  using SafeDecimalMath for uint256;
  using SafeERC20 for IERC20;

  // The address here is not hard coded so we can deploy the contract on multiple chains
  IERC20 public immutable POP;

  uint256 public keeperIncentiveBps;

  /**
   * @notice An array of addresses and amounts to send
   */
  DistributionData[] public override distributions;

  /* ========== EVENTS ========== */

  event RewardDistributionAdded(uint256 index, address destination, uint256 amount, bool isLocker);
  event RewardsDistributed(uint256 amount);
  event Log(uint256 amount);

  /* ========== CONSTRUCTOR ========== */

  constructor(
    address _owner,
    IContractRegistry _contractRegistry,
    IERC20 _pop
  ) Owned(_owner) ContractRegistryAccess(_contractRegistry) {
    POP = _pop;
  }

  /* ========== VIEWS ========== */

  /**
   * @notice Retrieve the length of the distributions array
   */
  function distributionsLength() external view override returns (uint256) {
    return distributions.length;
  }

  // ========== EXTERNAL FUNCTIONS ==========

  /**
   * @notice Setting Keeper Incentive for for `distributeRewards`
   * @param _keeperIncentiveBps Incentive Percentage in with 18 decimals.
   * @dev 1e18 == 100%, 1e14 == 1 BPS
   */
  function setKeeperIncentiveBps(uint256 _keeperIncentiveBps) external onlyOwner {
    keeperIncentiveBps = _keeperIncentiveBps;
  }

  /**
   * @notice Adds a Rewards DistributionData struct to the distributions
   * array. Any entries here will be iterated and rewards distributed to
   * each address when tokens are sent to this contract and distributeRewards()
   * is called by the autority.
   * @param destination An address to send rewards tokens too
   * @param amount The amount of rewards tokens to send
   * @param isLocker If the contract is a popLocker which has a slightly different notifyRewardsAmount interface
   */
  function addRewardDistribution(
    address destination,
    uint256 amount,
    bool isLocker
  ) external onlyOwner returns (bool) {
    require(destination != address(0), "Cant add a zero address");
    require(amount != 0, "Cant add a zero amount");

    POP.approve(destination, type(uint256).max);

    DistributionData memory rewardsDistribution = DistributionData(destination, amount, isLocker);
    distributions.push(rewardsDistribution);

    emit RewardDistributionAdded(distributions.length - 1, destination, amount, isLocker);
    return true;
  }

  /**
   * @notice Deletes a RewardDistribution from the distributions
   * so it will no longer be included in the call to distributeRewards()
   * @param index The index of the DistributionData to delete
   */
  function removeRewardDistribution(uint256 index) external onlyOwner {
    require(index <= distributions.length - 1, "index out of bounds");

    POP.approve(distributions[index].destination, 0);

    // shift distributions indexes across
    delete distributions[index];
  }

  /**
   * @notice Edits a RewardDistribution in the distributions array.
   * @param index The index of the DistributionData to edit
   * @param destination The destination address. Send the same address to keep or different address to change it.
   * @param amount The amount of tokens to edit. Send the same number to keep or change the amount of tokens to send.
   * @param isLocker If the contract is a popLocker which has a slightly different notifyRewardsAmount interface
   */
  function editRewardDistribution(
    uint256 index,
    address destination,
    uint256 amount,
    bool isLocker
  ) external onlyOwner returns (bool) {
    require(index <= distributions.length - 1, "index out of bounds");

    POP.approve(distributions[index].destination, 0);
    POP.approve(destination, type(uint256).max);

    distributions[index].destination = destination;
    distributions[index].amount = amount;
    distributions[index].isLocker = isLocker;

    return true;
  }

  function distributeRewards() external override keeperIncentive(0) returns (bool) {
    uint256 totalAmount;

    // Iterate the array of distributions sending the configured amounts
    for (uint256 i = 0; i < distributions.length; i++) {
      if (distributions[i].destination != address(0) || distributions[i].amount != 0) {
        // If the contract implements RewardsDistributionRecipient.sol, inform it how many POP its received.
        bytes memory payload;
        if (distributions[i].isLocker) {
          payload = abi.encodeWithSignature(
            "notifyRewardAmount(address,uint256)",
            address(POP),
            distributions[i].amount
          );
        } else {
          payload = abi.encodeWithSignature("notifyRewardAmount(uint256)", distributions[i].amount);
        }

        // solhint-disable avoid-low-level-calls
        (bool success, ) = distributions[i].destination.call(payload);

        require(success, "distribution failed");

        totalAmount += distributions[i].amount;
      }
    }
    uint256 incentive = (totalAmount * keeperIncentiveBps) / 1e18;

    POP.approve(_getContract(KEEPER_INCENTIVE), incentive);
    IKeeperIncentiveV2(_getContract(KEEPER_INCENTIVE)).tip(address(POP), msg.sender, 0, incentive);

    emit RewardsDistributed(totalAmount);
    return true;
  }

  /* ========== INTERNAL FUNCTIONS ========== */

  /**
   * @notice Override for KeeperIncentivized.
   */
  function _getContract(bytes32 _name)
    internal
    view
    override(KeeperIncentivized, ContractRegistryAccess)
    returns (address)
  {
    return super._getContract(_name);
  }
}
