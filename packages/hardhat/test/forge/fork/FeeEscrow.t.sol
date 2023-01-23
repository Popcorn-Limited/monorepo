// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

import "../../../contracts/core/utils/FeeEscrow.sol";
import "../../../contracts/mocks/MockERC20.sol";

// forge test --fork-url $FORKING_RPC_URL --match-contract FeeEscrowTest

contract FeeEscrowTest is Test {
  /* FeeEscrow events */
  event BurnerAddressAdded(address indexed feeToken, address indexed burnerAddress);
  event BurnerAddressRemoved(address indexed feeToken);
  event BurnerAddressChanged(address indexed feeToken, address indexed burnerAddress);
  event FeesBurned(address indexed feeToken, uint256 burnAmount);

  FeeEscrow public feeEscrow;
  MockERC20 public feeToken;
  address public burnerAddress = address(1234);
  address public burnerAddress2 = address(5678);

  function setUp() public {
    feeEscrow = new FeeEscrow();
    feeToken = new MockERC20("FeeToken", "FT", 18);

    vm.label(address(feeEscrow), "FeeEscrow");
    vm.label(address(this), "FeeEscrowTest");
    vm.label(address(feeToken), "FeeToken");
    vm.label(burnerAddress, "BurnerAddress");
    vm.label(burnerAddress2, "BurnerAddress2");

    feeToken.mint(address(this), 1e18);
  }

  /* ========== MUTATIVE FUNCTIONS TESTS ========== */

  /* Adding a burner address to FeeEscrow */

  function test__addBurnerAddressNoFeeTokenReverts() public {
    vm.expectRevert("need to specify fee token");
    feeEscrow.addBurnerAddress(address(0), burnerAddress);
  }

  function test__addBurnerAddressNoBurnerAddressReverts() public {
    vm.expectRevert("need to specify burner address");
    feeEscrow.addBurnerAddress(address(feeToken), address(0));
  }

  function test__addBurnerAddress() public {
    feeEscrow.addBurnerAddress(address(feeToken), burnerAddress);
    address feeEscrowBurnerAddress = feeEscrow.getBurnerAddress(address(feeToken));
    assertEq(feeEscrowBurnerAddress, burnerAddress);
    assertEq(feeEscrowBurnerAddress, address(1234));
    assertEq(feeEscrow.feeTokenToBurnerAddress(address(feeToken)), burnerAddress);
  }

  function test__addBurnerAddressEvent() public {
    vm.expectEmit(true, true, false, true, address(feeEscrow));
    emit BurnerAddressAdded(address(feeToken), burnerAddress);
    feeEscrow.addBurnerAddress(address(feeToken), burnerAddress);
  }

  /* Removing a burner address from FeeEscrow */

  function test__removeBurnerAddressNoFeeTokenReverts() public {
    vm.expectRevert("need to specify fee token");
    feeEscrow.removeBurnerAddress(address(0));
  }

  function test__removeBurnerAddress() public {
    feeEscrow.addBurnerAddress(address(feeToken), burnerAddress);
    assertEq(feeEscrow.getBurnerAddress(address(feeToken)), burnerAddress);
    feeEscrow.removeBurnerAddress(address(feeToken));
    vm.expectRevert("burner address not registered");
    feeEscrow.getBurnerAddress(address(feeToken));
    assertEq(feeEscrow.feeTokenToBurnerAddress(address(feeToken)), address(0));
  }

  function test__removeBurnerAddressEvent() public {
    feeEscrow.addBurnerAddress(address(feeToken), burnerAddress);
    assertEq(feeEscrow.getBurnerAddress(address(feeToken)), burnerAddress);
    vm.expectEmit(true, false, false, true, address(feeEscrow));
    emit BurnerAddressRemoved(address(feeToken));
    feeEscrow.removeBurnerAddress(address(feeToken));
  }

  /* Changing a burner address in FeeEscrow */

  function test__changeBurnerAddressNoFeeTokenReverts() public {
    feeEscrow.addBurnerAddress(address(feeToken), burnerAddress);
    assertEq(feeEscrow.getBurnerAddress(address(feeToken)), burnerAddress);
    vm.expectRevert("need to specify fee token");
    feeEscrow.changeBurnerAddress(address(0), burnerAddress2);
    assertEq(feeEscrow.getBurnerAddress(address(feeToken)), burnerAddress);
  }

  function test__changeBurnerAddressNoBurnerAddressReverts() public {
    feeEscrow.addBurnerAddress(address(feeToken), burnerAddress);
    assertEq(feeEscrow.getBurnerAddress(address(feeToken)), burnerAddress);
    vm.expectRevert("need to specify burner address");
    feeEscrow.changeBurnerAddress(address(feeToken), address(0));
    assertEq(feeEscrow.getBurnerAddress(address(feeToken)), burnerAddress);
  }

  function test__changeBurnerAddressNoBurnerAddressRegisteredReverts() public {
    vm.expectRevert("no burner address registered");
    feeEscrow.changeBurnerAddress(address(feeToken), burnerAddress2);
    assertEq(feeEscrow.feeTokenToBurnerAddress(address(feeToken)), address(0));
  }

  function test__changeBurnerAddress() public {
    feeEscrow.addBurnerAddress(address(feeToken), burnerAddress);
    assertEq(feeEscrow.getBurnerAddress(address(feeToken)), burnerAddress);
    feeEscrow.changeBurnerAddress(address(feeToken), burnerAddress2);
    assertTrue(feeEscrow.getBurnerAddress(address(feeToken)) != burnerAddress);
    assertEq(feeEscrow.getBurnerAddress(address(feeToken)), burnerAddress2);
    assertEq(feeEscrow.getBurnerAddress(address(feeToken)), address(5678));
    assertEq(feeEscrow.feeTokenToBurnerAddress(address(feeToken)), burnerAddress2);
  }

  function test__changeBurnerAddressEvent() public {
    feeEscrow.addBurnerAddress(address(feeToken), burnerAddress);
    assertEq(feeEscrow.getBurnerAddress(address(feeToken)), burnerAddress);
    vm.expectEmit(true, true, false, true, address(feeEscrow));
    emit BurnerAddressChanged(address(feeToken), burnerAddress2);
    feeEscrow.changeBurnerAddress(address(feeToken), burnerAddress2);
    assertEq(feeEscrow.getBurnerAddress(address(feeToken)), burnerAddress2);
  }

  /* Transferring fees to burner address from FeeEscrow */

  function test__transferFeesNoBurnerAddressRegisteredReverts() public {
    vm.expectRevert("no burner address registered");
    feeEscrow.transferFees(address(feeToken), 1e18);
  }

  function test__transferFeesNoBurnAmountReverts() public {
    feeEscrow.addBurnerAddress(address(feeToken), burnerAddress);
    assertEq(feeEscrow.getBurnerAddress(address(feeToken)), burnerAddress);
    vm.expectRevert("burn amount must be > 0");
    feeEscrow.transferFees(address(feeToken), 0);
  }

  function test__transferFees() public {
    feeEscrow.addBurnerAddress(address(feeToken), burnerAddress);
    assertEq(feeEscrow.getBurnerAddress(address(feeToken)), burnerAddress);
    uint256 burnAmount = 1e18;
    feeToken.approve(address(feeEscrow), burnAmount);
    feeEscrow.transferFees(address(feeToken), burnAmount);
    assertEq(feeToken.balanceOf(burnerAddress), burnAmount);
    assertEq(feeToken.balanceOf(address(this)), 0);
  }

  function test__transferFeesEvent() public {
    feeEscrow.addBurnerAddress(address(feeToken), burnerAddress);
    uint256 burnAmount = 1e18;
    feeToken.approve(address(feeEscrow), burnAmount);
    vm.expectEmit(true, false, false, true, address(feeEscrow));
    emit FeesBurned(address(feeToken), burnAmount);
    feeEscrow.transferFees(address(feeToken), burnAmount);
    assertEq(feeToken.balanceOf(burnerAddress), burnAmount);
  }
}
