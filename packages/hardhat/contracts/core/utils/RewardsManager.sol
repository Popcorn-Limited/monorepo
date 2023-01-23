// SPDX-License-Identifier: MIT

// Docgen-SOLC: 0.8.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "../interfaces/IKeeperIncentiveV2.sol";
import "../interfaces/IRegion.sol";
import "../interfaces/IStaking.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IInsurance.sol";
import "../interfaces/IBeneficiaryVaults.sol";
import "../interfaces/IRewardsManager.sol";
import "../interfaces/IACLRegistry.sol";
import "../interfaces/IContractRegistry.sol";

/**
 * @title Popcorn Rewards Manager
 * @notice Manages distribution of POP rewards to Popcorn Treasury, DAO Staking, and Beneficiaries
 */
contract RewardsManager is IRewardsManager, ReentrancyGuard {
  using SafeERC20 for IERC20;

  enum RewardTargets {
    Staking,
    Treasury,
    Insurance,
    BeneficiaryVaults
  }

  /* ========== STATE VARIABLES ========== */

  uint256 public constant SWAP_TIMEOUT = 600;
  bytes32 public immutable contractName = "RewardsManager";

  IContractRegistry public contractRegistry;
  IUniswapV2Router02 public immutable uniswapV2Router;

  uint256[4] public rewardSplits;
  mapping(uint8 => uint256[2]) private rewardLimits;

  /* ========== EVENTS ========== */

  event StakingDeposited(address to, uint256 amount);
  event TreasuryDeposited(address to, uint256 amount);
  event InsuranceDeposited(address to, uint256 amount);
  event BeneficiaryVaultsDeposited(uint256 amount);
  event RewardsDistributed(uint256 amount);
  event RewardSplitsUpdated(uint256[4] splits);
  event TokenSwapped(address token, uint256 amountIn, uint256 amountOut);
  event RegionChanged(IRegion from, IRegion to);

  /* ========== CONSTRUCTOR ========== */

  constructor(IContractRegistry _contractRegistry, IUniswapV2Router02 _uniswapV2Router) {
    contractRegistry = _contractRegistry;
    uniswapV2Router = _uniswapV2Router;
    rewardLimits[uint8(RewardTargets.Staking)] = [20e18, 80e18];
    rewardLimits[uint8(RewardTargets.Treasury)] = [10e18, 80e18];
    rewardLimits[uint8(RewardTargets.Insurance)] = [0, 10e18];
    rewardLimits[uint8(RewardTargets.BeneficiaryVaults)] = [20e18, 90e18];
    rewardSplits = [32e18, 32e18, 2e18, 34e18];
  }

  /* ========== VIEW FUNCTIONS ========== */

  function getRewardSplits() external view returns (uint256[4] memory) {
    return rewardSplits;
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  receive() external payable {}

  /**
   * @param _path Uniswap path specification for source token to POP
   * @param _minAmountOut Minimum desired amount (>0) of POP tokens to be received from swap
   * @dev Path specification requires at least source token as first in path and POP address as last
   * @dev Token swap internals implemented as described at https://uniswap.org/docs/v2/smart-contracts/router02/#swapexacttokensfortokens
   * @return swapped in/out amounts uint256 tuple
   */
  function swapTokenForRewards(address[] calldata _path, uint256 _minAmountOut)
    public
    nonReentrant
    returns (uint256[] memory)
  {
    IKeeperIncentiveV2(contractRegistry.getContract(keccak256("KeeperIncentive"))).handleKeeperIncentive(0, msg.sender);
    require(_path.length >= 2, "Invalid swap path");
    require(_minAmountOut > 0, "Invalid amount");
    require(_path[_path.length - 1] == contractRegistry.getContract(keccak256("POP")), "POP must be last in path");

    IERC20 token = IERC20(_path[0]);
    uint256 balance = token.balanceOf(address(this));
    require(balance > 0, "No swappable balance");

    token.safeIncreaseAllowance(address(uniswapV2Router), balance);
    uint256[] memory _amounts = uniswapV2Router.swapExactTokensForTokens(
      balance,
      _minAmountOut,
      _path,
      address(this),
      block.timestamp + SWAP_TIMEOUT
    );
    emit TokenSwapped(_path[0], _amounts[0], _amounts[1]);

    return _amounts;
  }

  /**
   * @notice Distribute POP rewards to dependent RewardTarget contracts
   * @dev Contract must have POP balance in order to distribute according to rewardSplits ratio
   */
  function distributeRewards() public nonReentrant {
    IKeeperIncentiveV2(contractRegistry.getContract(keccak256("KeeperIncentive"))).handleKeeperIncentive(1, msg.sender);
    uint256 availableReward = IERC20(contractRegistry.getContract(keccak256("POP"))).balanceOf(address(this));
    require(availableReward > 0, "No POP balance");

    //@todo check edge case precision overflow
    uint256 stakingAmount = (availableReward * rewardSplits[uint8(RewardTargets.Staking)]) / 100e18;
    uint256 treasuryAmount = (availableReward * rewardSplits[uint8(RewardTargets.Treasury)]) / 100e18;
    uint256 insuranceAmount = (availableReward * rewardSplits[uint8(RewardTargets.Insurance)]) / 100e18;
    uint256 beneficiaryVaultsAmount = (availableReward * rewardSplits[uint8(RewardTargets.BeneficiaryVaults)]) / 100e18;

    _distributeToStaking(stakingAmount);
    _distributeToTreasury(treasuryAmount);
    _distributeToInsurance(insuranceAmount);
    _distributeToVaults(beneficiaryVaultsAmount);

    emit RewardsDistributed(availableReward);
  }

  /* ========== RESTRICTED FUNCTIONS ========== */

  function _distributeToStaking(uint256 _amount) internal {
    if (_amount == 0) return;
    address staking = contractRegistry.getContract(keccak256("Staking"));
    IERC20(contractRegistry.getContract(keccak256("POP"))).safeApprove(staking, 0);
    IERC20(contractRegistry.getContract(keccak256("POP"))).safeApprove(staking, _amount);
    IStaking(staking).notifyRewardAmount(_amount);
    emit StakingDeposited(staking, _amount);
  }

  function _distributeToTreasury(uint256 _amount) internal {
    if (_amount == 0) return;
    address treasury = contractRegistry.getContract(keccak256("Treasury"));
    IERC20(contractRegistry.getContract(keccak256("POP"))).transfer(treasury, _amount);
    emit TreasuryDeposited(treasury, _amount);
  }

  function _distributeToInsurance(uint256 _amount) internal {
    if (_amount == 0) return;
    address insurance = contractRegistry.getContract(keccak256("Insurance"));
    IERC20(contractRegistry.getContract(keccak256("POP"))).transfer(insurance, _amount);
    emit InsuranceDeposited(insurance, _amount);
  }

  function _distributeToVaults(uint256 _amount) internal {
    if (_amount == 0) return;
    //This might lead to a gas overflow since the region array is unbound
    IERC20 POP = IERC20(contractRegistry.getContract(keccak256("POP")));
    address[] memory regionVaults = IRegion(contractRegistry.getContract(keccak256("Region"))).getAllVaults();
    uint256 split = _amount / regionVaults.length;
    for (uint256 i; i < regionVaults.length; i++) {
      POP.transfer(regionVaults[i], split);
    }
    emit BeneficiaryVaultsDeposited(_amount);
  }

  /* ========== SETTER ========== */

  /**
   * @notice Set new reward distribution allocations
   * @param _splits Array of RewardTargets enumerated uint256 values within rewardLimits range
   * @dev Values must be within rewardsLimit range, specified in percent to 18 decimal place precision
   */
  function setRewardSplits(uint256[4] calldata _splits) public {
    IACLRegistry(contractRegistry.getContract(keccak256("ACLRegistry"))).requireRole(keccak256("DAO"), msg.sender);
    uint256 total = 0;
    for (uint8 i = 0; i < 4; i++) {
      require(_splits[i] >= rewardLimits[i][0] && _splits[i] <= rewardLimits[i][1], "Invalid split");
      total = total + _splits[i];
    }
    require(total == 100e18, "Invalid split total");
    rewardSplits = _splits;
    emit RewardSplitsUpdated(_splits);
  }
}
