// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../../contracts/core/dao/Staking.sol";
import "../../../contracts/core/dao/RewardsDistribution.sol";
import "../../../contracts/core/utils/KeeperIncentiveV2.sol";
import "../../../contracts/core/interfaces/IRewardsEscrow.sol";

address constant CONTRACT_REGISTRY = 0x85831b53AFb86889c20aF38e654d871D8b0B7eC3;
address constant ACL_REGISTRY = 0x8A41aAa4B467ea545DDDc5759cE3D35984F093f4;
address constant ACL_ADMIN = 0x92a1cB552d0e177f3A135B4c87A4160C8f2a485f;
address constant POP_WHALE = 0x0Ec6290aBb4714ba5f1371647894Ce53c6dD673a;
address constant REWARDS_ESCROW = 0xb5cb5710044D1074097c17B7535a1cF99cBfb17F;

// @dev fork block 15008113
contract RewardsDistributionTest is Test {
  Staking public staking;
  IERC20 public pop = IERC20(0xD0Cd466b34A24fcB2f87676278AF2005Ca8A78c4);
  IERC20 public butter = IERC20(0x109d2034e97eC88f50BEeBC778b5A5650F98c124);
  RewardsDistribution public rewardsDistribution;
  KeeperIncentiveV2 public keeperIncentive;

  uint256 distributionAmount = 100 ether;
  address notOwner = address(0x1111);

  event RewardDistributionAdded(uint256 index, address destination, uint256 amount, bool isLocker);
  event RewardsDistributed(uint256 amount);
  event RewardAdded(uint256 reward);

  function setUp() public {
    uint256 forkId = vm.createSelectFork(vm.rpcUrl("FORKING_RPC_URL"), 15008113);
    vm.selectFork(forkId);

    keeperIncentive = new KeeperIncentiveV2(IContractRegistry(CONTRACT_REGISTRY), 25e16, 0 ether);
    rewardsDistribution = new RewardsDistribution(address(this), IContractRegistry(CONTRACT_REGISTRY), pop);
    staking = new Staking(pop, butter, IRewardsEscrow(REWARDS_ESCROW));

    vm.startPrank(ACL_ADMIN);
    IContractRegistry(CONTRACT_REGISTRY).updateContract(
      keccak256("KeeperIncentive"),
      address(keeperIncentive),
      keccak256("2")
    );
    IACLRegistry(ACL_REGISTRY).grantRole(keccak256("INCENTIVE_MANAGER_ROLE"), address(this));
    vm.stopPrank();

    keeperIncentive.createIncentive(address(rewardsDistribution), 0, false, true, address(pop), 1, 0);
    staking.approveRewardDistributor(address(rewardsDistribution), true);

    vm.prank(POP_WHALE);
    pop.transfer(address(rewardsDistribution), distributionAmount * 2);
  }

  /* Add RewardsDistribution */
  function test__addRewardsDistributionNotOwnerReverts() public {
    vm.prank(notOwner);
    vm.expectRevert("Only the contract owner may perform this action");
    rewardsDistribution.addRewardDistribution(address(staking), distributionAmount, false);
  }

  function test__addRewardsDistributionAddressZeroReverts() public {
    vm.expectRevert("Cant add a zero address");
    rewardsDistribution.addRewardDistribution(address(0), distributionAmount, false);
  }

  function test__addRewardsDistributionAmountIsZeroReverts() public {
    vm.expectRevert("Cant add a zero amount");
    rewardsDistribution.addRewardDistribution(address(staking), uint256(0), false);
  }

  function test__addRewardsDistribution() public {
    rewardsDistribution.addRewardDistribution(address(staking), distributionAmount, false);

    assertEq(pop.allowance(address(rewardsDistribution), address(staking)), type(uint256).max);
    assertEq(rewardsDistribution.distributionsLength(), 1);

    (address destination, uint256 amount, bool isLocker) = rewardsDistribution.distributions(0);
    assertEq(destination, address(staking));
    assertEq(amount, distributionAmount);
    assertEq(isLocker, false);
  }

  function test__addRewardsDistributionEvent() public {
    vm.expectEmit(false, false, false, true, address(rewardsDistribution));
    emit RewardDistributionAdded(0, address(staking), distributionAmount, false);
    rewardsDistribution.addRewardDistribution(address(staking), distributionAmount, false);
  }

  /* Edit RewardsDistribution */
  function test__editRewardsDistributionNotOwnerReverts() public {
    rewardsDistribution.addRewardDistribution(address(staking), distributionAmount, false);

    vm.prank(notOwner);
    vm.expectRevert("Only the contract owner may perform this action");
    rewardsDistribution.editRewardDistribution(0, address(staking), distributionAmount, false);
  }

  function test__editRewardsDistributionIndexOutOfBoundsReverts() public {
    rewardsDistribution.addRewardDistribution(address(staking), distributionAmount, false);

    vm.expectRevert("index out of bounds");
    rewardsDistribution.editRewardDistribution(1, address(staking), distributionAmount, false);
  }

  function test__editRewardsDistribution() public {
    rewardsDistribution.addRewardDistribution(address(staking), distributionAmount, false);

    rewardsDistribution.editRewardDistribution(0, address(0x7777), distributionAmount * 2, true);

    assertEq(pop.allowance(address(rewardsDistribution), address(staking)), uint256(0));
    assertEq(pop.allowance(address(rewardsDistribution), address(0x7777)), type(uint256).max);

    (address destination, uint256 amount, bool isLocker) = rewardsDistribution.distributions(0);
    assertEq(destination, address(0x7777));
    assertEq(amount, distributionAmount * 2);
    assertEq(isLocker, true);
  }

  /* Remove RewardsDistribution */
  function test__removeRewardsDistributionNotOwnerReverts() public {
    rewardsDistribution.addRewardDistribution(address(staking), distributionAmount, false);

    vm.prank(notOwner);
    vm.expectRevert("Only the contract owner may perform this action");
    rewardsDistribution.removeRewardDistribution(0);
  }

  function test__removeRewardsDistributionIndexOutOfBoundsReverts() public {
    rewardsDistribution.addRewardDistribution(address(staking), distributionAmount, false);

    vm.expectRevert("index out of bounds");
    rewardsDistribution.removeRewardDistribution(1);
  }

  function test__removeRewardsDistribution() public {
    rewardsDistribution.addRewardDistribution(address(staking), distributionAmount, false);

    rewardsDistribution.removeRewardDistribution(0);

    assertEq(pop.allowance(address(rewardsDistribution), address(staking)), uint256(0));

    (address destination, uint256 amount, bool isLocker) = rewardsDistribution.distributions(0);
    assertEq(destination, address(0));
    assertEq(amount, uint256(0));
    assertEq(isLocker, false);
  }

  /* Distribute Rewards */
  function test__distributeRewards() public {
    rewardsDistribution.addRewardDistribution(address(staking), distributionAmount, false);
    rewardsDistribution.setKeeperIncentiveBps(uint256(1e14));

    rewardsDistribution.distributeRewards();
    assertEq(pop.balanceOf(address(staking)), distributionAmount);

    assertEq(pop.balanceOf(address(keeperIncentive)), (distributionAmount * 1e14) / 1e18);
  }

  function test__distributeRewardsEvent() public {
    rewardsDistribution.addRewardDistribution(address(staking), distributionAmount, false);
    rewardsDistribution.setKeeperIncentiveBps(uint256(1e14));

    vm.expectEmit(false, false, false, true, address(rewardsDistribution));
    emit RewardsDistributed(distributionAmount);

    rewardsDistribution.distributeRewards();
  }

  function test__distributeRewardsSuccessfulStakingEvent() public {
    rewardsDistribution.addRewardDistribution(address(staking), distributionAmount, false);
    rewardsDistribution.setKeeperIncentiveBps(uint256(1e14));

    vm.expectEmit(false, false, false, true, address(staking));
    emit RewardAdded(distributionAmount);

    rewardsDistribution.distributeRewards();
  }

  /* Set KeeperIncentiveBps */
  function test__setKeeperIncentiveBpsNotOwnerReverts() public {
    rewardsDistribution.addRewardDistribution(address(staking), distributionAmount, false);

    vm.prank(notOwner);
    vm.expectRevert("Only the contract owner may perform this action");
    rewardsDistribution.setKeeperIncentiveBps(uint256(1e14));
  }

  function test__setKeeperIncentiveBps() public {
    rewardsDistribution.setKeeperIncentiveBps(uint256(1e14));

    assertEq(rewardsDistribution.keeperIncentiveBps(), uint256(1e14));
  }
}
