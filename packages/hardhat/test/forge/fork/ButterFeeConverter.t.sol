// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import { Test } from "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

import "../../../contracts/core/defi/butter/ButterFeeConverter.sol";
import "../../../contracts/core/utils/RewardsManager.sol";
import "../../../contracts/core/utils/KeeperIncentiveV2.sol";
import "../../../contracts/core/interfaces/IACLRegistry.sol";
import "../../../contracts/core/interfaces/IContractRegistry.sol";
import "../../../contracts/core/interfaces/IButterBatchProcessing.sol";

import "../../../contracts/externals/interfaces/Curve3Pool.sol";
import "../../../contracts/externals/interfaces/ISetToken.sol";
import "../../../contracts/externals/interfaces/IStreamingFeeModule.sol";

// @dev fork block 15008113
contract ButterFeeConverterTest is Test {
  ISetToken internal butter;
  IStreamingFeeModule internal streamingFeeModule;
  Curve3Pool internal threePool;
  IACLRegistry internal aclRegistry;
  IContractRegistry internal contractRegistry;
  IERC20Metadata internal threeCrv;
  ButterFeeConverter internal converter;
  IButterBatchProcessing internal butterBatchProcessing;
  KeeperIncentiveV2 internal keeperIncentive;

  IERC20Metadata internal preferredStable;

  address constant rewardsManager = address(42);

  address constant BTR_TOKEN = address(0x109d2034e97eC88f50BEeBC778b5A5650F98c124);
  address constant SET_STREAMING_FEE_MODULE = address(0x08f866c74205617B6F3903EF481798EcED10cDEC);
  address constant THREE_POOL = address(0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7);
  address constant THREE_CRV = address(0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490);
  address constant UNISWAP_ROUTER = address(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);

  address constant ACL_REGISTRY = address(0x8A41aAa4B467ea545DDDc5759cE3D35984F093f4);
  address constant CONTRACT_REGISTRY = address(0x85831b53AFb86889c20aF38e654d871D8b0B7eC3);

  address constant ADMIN = address(0x92a1cB552d0e177f3A135B4c87A4160C8f2a485f);

  event FeeTransferredToRewardsManager(
    address indexed keeper,
    int128 preferredStableCoinIndex,
    uint256 threeCrvAmount,
    uint256 keeperTip,
    uint256 stableCoinAmount
  );
  event PreferredStableCoinIndexUpdated(int128 oldIndex, int128 newIndex);
  event MaxSlippageUpdated(uint256 oldSlippage, uint256 newSlippage);
  event KeeperTipUpdated(uint256 oldKeeperTip, uint256 newKeeperTip);

  function setUp() public {
    uint256 forkId = vm.createSelectFork(vm.rpcUrl("FORKING_RPC_URL"), 15008113);
    vm.selectFork(forkId);

    butter = ISetToken(BTR_TOKEN);
    streamingFeeModule = IStreamingFeeModule(SET_STREAMING_FEE_MODULE);
    aclRegistry = IACLRegistry(ACL_REGISTRY);
    contractRegistry = IContractRegistry(CONTRACT_REGISTRY);
    threePool = Curve3Pool(THREE_POOL);
    threeCrv = IERC20Metadata(THREE_CRV);
    butterBatchProcessing = IButterBatchProcessing(contractRegistry.getContract(keccak256("ButterBatchProcessing")));

    converter = new ButterFeeConverter(
      butter,
      streamingFeeModule,
      contractRegistry,
      threePool,
      threeCrv,
      int128(1),
      250
    );
    keeperIncentive = new KeeperIncentiveV2(contractRegistry, 0, 0);

    preferredStable = IERC20Metadata(threePool.coins(1));

    vm.startPrank(ADMIN);

    aclRegistry.grantRole(keccak256("ApprovedContract"), address(converter));
    aclRegistry.grantRole(keccak256("INCENTIVE_MANAGER_ROLE"), address(ADMIN));

    streamingFeeModule.updateFeeRecipient(butter, address(converter));
    butterBatchProcessing.setRedemptionFee(10, address(converter));

    contractRegistry.addContract(keccak256("RewardsManager"), rewardsManager, keccak256("1"));
    contractRegistry.updateContract(keccak256("KeeperIncentive"), address(keeperIncentive), keccak256("2"));

    keeperIncentive.createIncentive(address(converter), 0, true, true, address(threeCrv), 1, 0);

    vm.stopPrank();

    // Note: This warp seems to hugely increase the gas costs of the Butter batch redeem step...
    vm.warp(block.timestamp + 365 * 1 days);
  }

  function test_has_contract_name() public {
    assertEq(converter.contractName(), keccak256("ButterFeeConverter"));
  }

  function test_has_streaming_fee_module() public {
    assertEq(address(converter.streamingFeeModule()), address(streamingFeeModule));
  }

  function test_has_btr_token() public {
    assertEq(address(converter.butter()), address(butter));
  }

  function test_has_three_pool() public {
    assertEq(address(converter.threePool()), address(threePool));
  }

  function test_has_three_crv() public {
    assertEq(address(converter.threeCRV()), address(threeCrv));
  }

  function test_has_preferred_coin() public {
    assertEq(converter.preferredStableCoinIndex(), 1);
  }

  function test_set_preferred_coin() public {
    assertEq(converter.preferredStableCoinIndex(), 1);

    vm.expectEmit(false, false, false, true, address(converter));
    emit PreferredStableCoinIndexUpdated(1, 0);

    vm.prank(ADMIN);
    converter.setPreferredStableCoinIndex(int128(0));

    assertEq(converter.preferredStableCoinIndex(), 0);

    vm.expectEmit(false, false, false, true, address(converter));
    emit PreferredStableCoinIndexUpdated(0, 2);

    vm.prank(ADMIN);
    converter.setPreferredStableCoinIndex(int128(2));

    assertEq(converter.preferredStableCoinIndex(), 2);
  }

  function test_reverts_on_invalid_index() public {
    vm.prank(ADMIN);
    vm.expectRevert("Invalid index");
    converter.setPreferredStableCoinIndex(-1);

    vm.prank(ADMIN);
    vm.expectRevert("Invalid index");
    converter.setPreferredStableCoinIndex(3);
  }

  function test_set_preferred_coin_reverts_on_invalid_role() public {
    vm.expectRevert("you dont have the right role");
    converter.setPreferredStableCoinIndex(2);
  }

  function test_set_max_slippage() public {
    assertEq(converter.maxSlippage(), 50);

    vm.expectEmit(false, false, false, true, address(converter));
    emit MaxSlippageUpdated(50, 1000);

    vm.prank(ADMIN);
    converter.setMaxSlippage(1000);

    assertEq(converter.maxSlippage(), 1000);
  }

  function test_reverts_on_invalid_slippage() public {
    vm.prank(ADMIN);
    vm.expectRevert("Invalid slippage");
    converter.setMaxSlippage(10001);
  }

  function test_set_max_slippage_reverts_on_invalid_role() public {
    vm.expectRevert("you dont have the right role");
    converter.setMaxSlippage(1000);
  }

  function test_set_keeper_tip() public {
    assertEq(converter.keeperTip(), 250);

    vm.expectEmit(false, false, false, true, address(converter));
    emit KeeperTipUpdated(250, 500);

    vm.prank(ADMIN);
    converter.setKeeperTip(500);

    assertEq(converter.keeperTip(), 500);
  }

  function test_reverts_on_invalid_tip() public {
    vm.prank(ADMIN);
    vm.expectRevert("Invalid tip");
    converter.setKeeperTip(10001);
  }

  function test_set_keeper_reverts_on_invalid_role() public {
    vm.expectRevert("you dont have the right role");
    converter.setKeeperTip(1000);
  }

  function test_accrue_fee_usdc() public {
    assertEq(preferredStable.balanceOf(address(rewardsManager)), 0);

    vm.expectEmit(true, false, false, true, address(converter));
    emit FeeTransferredToRewardsManager(address(this), 1, 11723638014446496341294, 299212623, 11669292332);

    converter.accrueFee();

    assertEq(preferredStable.balanceOf(address(rewardsManager)), 11669292332);
  }

  function test_accrue_fee_dai() public {
    vm.prank(ADMIN);
    converter.setPreferredStableCoinIndex(int128(0));
    preferredStable = IERC20Metadata(threePool.coins(0));

    assertEq(preferredStable.balanceOf(address(rewardsManager)), 0);

    vm.expectEmit(true, false, false, true, address(converter));
    emit FeeTransferredToRewardsManager(
      address(this),
      0,
      11723638014446496341294,
      299208332027310994108,
      11669124949065128770215
    );

    converter.accrueFee();

    assertEq(preferredStable.balanceOf(address(rewardsManager)), 11669124949065128770215);
  }

  function test_accrue_fee_usdt() public {
    assertFalse(keeperIncentive.hasClaimableBalance(address(this)));

    vm.prank(ADMIN);
    converter.setPreferredStableCoinIndex(int128(2));
    preferredStable = IERC20Metadata(threePool.coins(2));

    assertEq(preferredStable.balanceOf(address(rewardsManager)), 0);

    vm.expectEmit(true, false, false, true, address(converter));
    emit FeeTransferredToRewardsManager(address(this), 2, 11723638014446496341294, 299590511, 11684029951);

    converter.accrueFee();

    assertTrue(keeperIncentive.hasClaimableBalance(address(this)));
    assertEq(preferredStable.balanceOf(address(rewardsManager)), 11684029951);
  }

  function test_scale_value() public {
    assertEq(converter.scaleValue(1e36, 18), 1e18);
    assertEq(converter.scaleValue(1e36, 6), 1e6);
  }
}
