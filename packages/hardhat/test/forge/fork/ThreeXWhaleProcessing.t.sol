// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Test } from "forge-std/Test.sol";

import { ThreeXWhaleProcessing, ThreeXBatchVault } from "../../../contracts/core/defi/three-x/ThreeXWhaleProcessing.sol";
import { ThreeXBatchProcessing } from "../../../contracts/core/defi/three-x/ThreeXBatchProcessing.sol";
import "../../../contracts/core/interfaces/IContractRegistry.sol";
import { AbstractBatchStorage } from "../../../contracts/core/defi/three-x/storage/AbstractBatchStorage.sol";
import "../../../contracts/core/interfaces/IStaking.sol";
import "../../../contracts/core/interfaces/IBatchStorage.sol";
import "../../../contracts/externals/interfaces/Curve3Pool.sol";
import "../../../contracts/externals/interfaces/IBasicIssuanceModule.sol";
import "../../../contracts/core/interfaces/IACLRegistry.sol";

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

address constant THREE_X = 0x8b97ADE5843c9BE7a1e8c95F32EC192E31A46cf3;
address constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
address constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
address constant CONTRACT_REGISTRY = 0x85831b53AFb86889c20aF38e654d871D8b0B7eC3;
address constant BASIC_ISSUANCE_MODULE = 0xd8EF3cACe8b4907117a45B0b125c68560532F94D;
address constant STAKING = 0x584732f867a4533BC349d438Fba4fc2aEE5f5f83;
address constant THREE_POOL = 0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7;
address constant THREEX_VAULT = 0x0B4E13D8019D0F762377570000D9C923f0dad82B;
address constant ACL_REGISTRY = 0x8A41aAa4B467ea545DDDc5759cE3D35984F093f4;
address constant THREEX_BATCH = 0x42189f909e1EFA409A4509070dDBc31A592422A8;
address constant DAO = 0x92a1cB552d0e177f3A135B4c87A4160C8f2a485f;
address constant Y_SUSD = 0x5a770DbD3Ee6bAF2802D29a901Ef11501C44797A;
address constant Y_THREE_EUR = 0x5AB64C599FcC59f0f2726A300b03166A395578Da;

// Run with block number 15008113
// forge test --fork-url https://eth-mainnet.alchemyapi.io/v2/PRIV_KEY --fork-block-number 15008113 --match-contract ThreeXWhaleProcessing -vvv
contract ThreeXWhaleProcessingTest is Test {
  using SafeERC20 for IERC20;

  IERC20[3] internal tokens;
  ThreeXWhaleProcessing internal threeXWhaleProcessing;
  IBasicIssuanceModule internal basicIssuanceModule = IBasicIssuanceModule(BASIC_ISSUANCE_MODULE);
  ThreeXBatchProcessing internal threeXBatchProcessing = ThreeXBatchProcessing(THREEX_BATCH);
  IStaking internal staking = IStaking(STAKING);
  IERC20 internal threex = IERC20(THREE_X);
  IERC20 internal dai = IERC20(DAI);
  IERC20 internal usdc = IERC20(USDC);
  IERC20 internal usdt = IERC20(USDT);

  uint256 immutable usdcAmountToMint = 100e6;
  uint256 immutable daiAmountToMint = 100 ether;
  uint256 immutable threeXAmountToRedeem = 100 ether;
  uint256 immutable usdtAmountToMint = 100e6;

  uint256 defaultMintSlippage;
  uint256 defaultRedeemSlippage;

  // Preconditions saved during setup for each test.
  bytes32 mintbatchId;
  uint256 threeXBalanceBefore;
  uint256 usdcBalanceBefore;
  uint256 stakedBalanceBefore;
  bytes32 redeemBatchId;
  uint256 daiBalanceBefore;
  uint256 usdtBalanceBefore;

  function setUp() public {
    uint256 forkId = vm.createSelectFork(vm.rpcUrl("FORKING_RPC_URL"), 15008113);
    vm.selectFork(forkId);

    tokens = [dai, usdc, usdt];
    threeXWhaleProcessing = new ThreeXWhaleProcessing(
      IContractRegistry(CONTRACT_REGISTRY),
      basicIssuanceModule,
      staking,
      Curve3Pool(THREE_POOL),
      tokens
    );
    threeXWhaleProcessing.setApprovals();

    // Manage setting the connection to BatchProcessing and setting up Roles/Permissions/connections on WhaleProcessing
    vm.startPrank(DAO);
    vm.warp(block.timestamp - 3 days);
    threeXBatchProcessing.grantClientAccess(address(threeXWhaleProcessing));
    vm.warp(block.timestamp + 3 days);
    ThreeXBatchVault(THREEX_VAULT).addClient(address(threeXWhaleProcessing));
    threeXWhaleProcessing.setBatchStorage(AbstractBatchStorage(THREEX_VAULT));
    threeXWhaleProcessing.acceptClientAccess(address(THREEX_BATCH));
    threeXWhaleProcessing.setFee("mint", 0, address(0), threex);
    threeXWhaleProcessing.setFee("redeem", 0, address(0), usdc);
    IACLRegistry(ACL_REGISTRY).grantRole(keccak256("ApprovedContract"), address(this));
    IACLRegistry(ACL_REGISTRY).grantRole(keccak256("ApprovedContract"), address(threeXWhaleProcessing));
    IACLRegistry(ACL_REGISTRY).grantRole(keccak256("Keeper"), address(threeXWhaleProcessing));
    vm.stopPrank();

    // Set Approvals for test persona
    usdc.approve(address(threeXWhaleProcessing), type(uint256).max);
    usdt.safeApprove(address(threeXWhaleProcessing), type(uint256).max);
    dai.approve(address(threeXWhaleProcessing), type(uint256).max);
    threex.approve(address(threeXWhaleProcessing), type(uint256).max);

    // Hand out money
    deal(USDC, address(this), 100000e6);
    deal(DAI, address(this), 100000e18);
    deal(USDT, address(this), 100000e6);

    // Save Preconditions before each test which can be referenced during testing
    (defaultMintSlippage, defaultRedeemSlippage) = threeXBatchProcessing.slippage();

    mintbatchId = threeXBatchProcessing.currentMintBatchId();
    redeemBatchId = threeXBatchProcessing.currentRedeemBatchId();

    threeXBalanceBefore = threex.balanceOf(address(this));
    usdcBalanceBefore = usdc.balanceOf(address(this));
    stakedBalanceBefore = staking.balanceOf(address(this));
    daiBalanceBefore = dai.balanceOf(address(this));
    usdtBalanceBefore = usdt.balanceOf(address(this));
  }

  function mintThreeX(uint256 _amount) internal {
    deal(USDC, address(this), _amount * 30000e6);

    bytes32 batchId = threeXBatchProcessing.currentMintBatchId();
    usdc.approve(address(threeXBatchProcessing), type(uint256).max);

    threeXBatchProcessing.depositForMint(_amount * 30000e6, address(this));

    vm.prank(DAO);
    threeXBatchProcessing.batchMint();

    threeXBatchProcessing.claim(batchId, address(this));
    usdcBalanceBefore = usdc.balanceOf(address(this));
    threeXBalanceBefore = threex.balanceOf(address(this));
  }

  function getMinMintAmount(uint256 _amount, uint256 _slippageBps) internal view returns (uint256) {
    // Needs number in 1e18 base in _amount
    address[] memory tokenAddresses;
    uint256[] memory quantities;
    (tokenAddresses, quantities) = basicIssuanceModule.getRequiredComponentUnitsForIssue(ISetToken(THREE_X), 1e18);
    return
      threeXBatchProcessing.getMinAmountToMint(
        _amount,
        threeXBatchProcessing.valueOfComponents(tokenAddresses, quantities),
        _slippageBps
      );
  }

  function getMinRedeemAmount(uint256 _amount, uint256 _slippageBps) internal view returns (uint256) {
    // Needs number in 1e18 base in _amount
    address[] memory tokenAddresses;
    uint256[] memory quantities;
    (tokenAddresses, quantities) = basicIssuanceModule.getRequiredComponentUnitsForIssue(ISetToken(THREE_X), _amount);
    return
      threeXBatchProcessing.getMinAmountFromRedeem(
        threeXBatchProcessing.valueOfComponents(tokenAddresses, quantities),
        _slippageBps
      );
  }

  function test_mint_high_slippage() public {
    // Should use personal mint
    uint256 expectedMint = getMinMintAmount(usdcAmountToMint * 1e12, 150);
    threeXWhaleProcessing.mint(usdcAmountToMint, expectedMint, false);
    uint256 threeXBalanceAfter = threex.balanceOf(address(this));
    uint256 usdcBalanceAfter = usdc.balanceOf(address(this));
    assertGe(threeXBalanceAfter, threeXBalanceBefore + expectedMint);
    assertEq(usdcBalanceBefore - usdcAmountToMint, usdcBalanceAfter);
    assertTrue(!threeXBatchProcessing.getBatch(mintbatchId).claimable);
  }

  function test_mint_regular_slippage() public {
    // Should use batch mint
    uint256 expectedMint = getMinMintAmount(usdcAmountToMint * 1e12, defaultMintSlippage);
    threeXWhaleProcessing.mint(usdcAmountToMint, expectedMint, false);
    uint256 threeXBalanceAfter = threex.balanceOf(address(this));
    uint256 usdcBalanceAfter = usdc.balanceOf(address(this));
    assertGe(threeXBalanceAfter, threeXBalanceBefore + expectedMint);
    assertEq(usdcBalanceBefore - usdcAmountToMint, usdcBalanceAfter);
    assertTrue(threeXBatchProcessing.getBatch(mintbatchId).claimable);
  }

  function test_mint_low_slippage() public {
    // Should use personal mint
    uint256 expectedMint = getMinMintAmount(usdcAmountToMint * 1e12, 5);
    vm.expectRevert("slippage too high");
    threeXWhaleProcessing.mint(usdcAmountToMint, expectedMint, false);
  }

  function test_mint_stake_high_slippage() public {
    // Should use personal mint
    uint256 expectedMint = getMinMintAmount(usdcAmountToMint * 1e12, 1000);
    threeXWhaleProcessing.mint(usdcAmountToMint, expectedMint, true);
    uint256 stakedBalanceAfter = staking.balanceOf(address(this));
    uint256 usdcBalanceAfter = usdc.balanceOf(address(this));
    assertGe(stakedBalanceAfter, stakedBalanceBefore + expectedMint);
    assertEq(usdcBalanceBefore - usdcAmountToMint, usdcBalanceAfter);
    assertTrue(!threeXBatchProcessing.getBatch(mintbatchId).claimable);
  }

  function test_mint_stake_regular_slippage() public {
    // Should use batch mint
    uint256 expectedMint = getMinMintAmount(usdcAmountToMint * 1e12, defaultMintSlippage);
    threeXWhaleProcessing.mint(usdcAmountToMint, expectedMint, true);
    uint256 stakedBalanceAfter = staking.balanceOf(address(this));
    uint256 usdcBalanceAfter = usdc.balanceOf(address(this));
    assertGe(stakedBalanceAfter, stakedBalanceBefore + expectedMint);
    assertEq(usdcBalanceBefore - usdcAmountToMint, usdcBalanceAfter);
    assertTrue(threeXBatchProcessing.getBatch(mintbatchId).claimable);
  }

  function test_redeem_high_slippage() public {
    // Should use personal redeem
    mintThreeX(200);
    uint256 expectedRedeem = getMinRedeemAmount(threeXAmountToRedeem, 1000);
    threeXWhaleProcessing.redeem(threeXAmountToRedeem, expectedRedeem);
    uint256 threeXBalanceAfter = threex.balanceOf(address(this));
    uint256 usdcBalanceAfter = usdc.balanceOf(address(this));
    assertEq(threeXBalanceAfter, threeXBalanceBefore - threeXAmountToRedeem);
    assertGe(usdcBalanceAfter, usdcBalanceBefore + expectedRedeem);
    assertTrue(!threeXBatchProcessing.getBatch(redeemBatchId).claimable);
  }

  function test_redeem_regular_slippage() public {
    // Should use batch redeem
    mintThreeX(200);
    uint256 expectedRedeem = getMinRedeemAmount(threeXAmountToRedeem, defaultRedeemSlippage);
    threeXWhaleProcessing.redeem(threeXAmountToRedeem, expectedRedeem);
    uint256 threeXBalanceAfter = threex.balanceOf(address(this));
    uint256 usdcBalanceAfter = usdc.balanceOf(address(this));
    assertEq(threeXBalanceAfter, threeXBalanceBefore - threeXAmountToRedeem);
    assertGe(usdcBalanceAfter, usdcBalanceBefore + expectedRedeem);
    assertTrue(threeXBatchProcessing.getBatch(redeemBatchId).claimable);
  }

  function test_redeem_low_slippage() public {
    // Should use batch redeem
    mintThreeX(200);
    uint256 expectedRedeem = getMinRedeemAmount(threeXAmountToRedeem, 0);
    vm.expectRevert("slippage too high");
    threeXWhaleProcessing.redeem(threeXAmountToRedeem, expectedRedeem);
  }

  function test_zap_dai_mint_high_slippage() public {
    // Should use personal mint
    uint256 expectedMint = getMinMintAmount(daiAmountToMint, 1000);
    threeXWhaleProcessing.mint(daiAmountToMint, 0, 1, expectedMint, false);
    uint256 threeXBalanceAfter = threex.balanceOf(address(this));
    uint256 daiBalanceAfter = dai.balanceOf(address(this));
    assertGe(threeXBalanceAfter, threeXBalanceBefore + expectedMint);
    assertEq(daiBalanceBefore - daiAmountToMint, daiBalanceAfter);
    assertTrue(!threeXBatchProcessing.getBatch(mintbatchId).claimable);
  }

  function test_zap_dai_mint_regular_slippage() public {
    // Should use batch mint
    // In order to successfully use the batch process for minting the default slippage has to be increased here due to market conditions. Might not be nesseccary if starting on a different block number
    uint256 higherDefaultSlippage = 120;
    vm.prank(DAO);
    threeXBatchProcessing.setSlippage(higherDefaultSlippage, higherDefaultSlippage);
    uint256 expectedMint = getMinMintAmount(daiAmountToMint, higherDefaultSlippage);
    threeXWhaleProcessing.mint(daiAmountToMint, 0, 1, expectedMint, false);
    uint256 threeXBalanceAfter = threex.balanceOf(address(this));
    uint256 daiBalanceAfter = dai.balanceOf(address(this));
    assertGe(threeXBalanceAfter, threeXBalanceBefore + expectedMint);
    assertEq(daiBalanceBefore - daiAmountToMint, daiBalanceAfter);
    assertTrue(threeXBatchProcessing.getBatch(mintbatchId).claimable);
  }

  function test_zap_dai_redeem_high_slippage() public {
    // Should use batch redeem
    mintThreeX(200);
    uint256 expectedRedeem = getMinRedeemAmount(threeXAmountToRedeem, 1000);
    threeXWhaleProcessing.redeem(threeXAmountToRedeem, 1, 0, expectedRedeem);
    uint256 threeXBalanceAfter = threex.balanceOf(address(this));
    uint256 daiBalanceAfter = dai.balanceOf(address(this));
    assertEq(threeXBalanceAfter, threeXBalanceBefore - threeXAmountToRedeem);
    assertGe(daiBalanceAfter, daiBalanceBefore + expectedRedeem);
    assertTrue(!threeXBatchProcessing.getBatch(redeemBatchId).claimable);
  }

  function test_zap_dai_redeem_regular_slippage() public {
    // Should use batch redeem
    mintThreeX(200);
    uint256 expectedRedeem = getMinRedeemAmount(threeXAmountToRedeem, defaultRedeemSlippage);
    threeXWhaleProcessing.redeem(threeXAmountToRedeem, 1, 0, expectedRedeem);
    uint256 threeXBalanceAfter = threex.balanceOf(address(this));
    uint256 daiBalanceAfter = dai.balanceOf(address(this));
    assertEq(threeXBalanceAfter, threeXBalanceBefore - threeXAmountToRedeem);
    assertGe(daiBalanceAfter, daiBalanceBefore + expectedRedeem);
    assertTrue(threeXBatchProcessing.getBatch(redeemBatchId).claimable);
  }

  function test_zap_usdt_mint_high_slippage() public {
    // Should use personal mint
    uint256 expectedMint = getMinMintAmount(usdtAmountToMint * 1e12, 1000);
    threeXWhaleProcessing.mint(usdtAmountToMint, 2, 1, expectedMint, false);
    uint256 threeXBalanceAfter = threex.balanceOf(address(this));
    uint256 usdtBalanceAfter = usdt.balanceOf(address(this));
    assertGe(threeXBalanceAfter, threeXBalanceBefore + expectedMint);
    assertEq(usdtBalanceBefore - usdtAmountToMint, usdtBalanceAfter);
    assertTrue(!threeXBatchProcessing.getBatch(mintbatchId).claimable);
  }

  function test_zap_usdt_redeem_high_slippage() public {
    // Should use batch redeem
    mintThreeX(200);
    uint256 expectedRedeem = getMinRedeemAmount(threeXAmountToRedeem, 1000);
    threeXWhaleProcessing.redeem(threeXAmountToRedeem, 1, 2, expectedRedeem);
    uint256 threeXBalanceAfter = threex.balanceOf(address(this));
    uint256 usdtBalanceAfter = usdt.balanceOf(address(this));
    assertEq(threeXBalanceAfter, threeXBalanceBefore - threeXAmountToRedeem);
    assertGe(usdtBalanceAfter, usdtBalanceBefore + expectedRedeem);
  }
}
