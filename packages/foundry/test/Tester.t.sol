// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;
import { Test } from "forge-std/Test.sol";
import { Math } from "openzeppelin-contracts/utils/math/Math.sol";
import { MockERC20 } from "./utils/mocks/MockERC20.sol";
import { MultiRewardEscrow, Escrow, IERC20 } from "../src/utils/MultiRewardEscrow.sol";
import { SafeCastLib } from "solmate/utils/SafeCastLib.sol";

contract Tester is Test {
  IERC20 usdt = IERC20(0xdAC17F958D2ee523a2206206994597C13D831ec7);

  function setUp() public {
    uint256 forkId = vm.createSelectFork(vm.rpcUrl("mainnet"));
    vm.selectFork(forkId);
  }

  function test_approval() public {
    emit log_uint(usdt.allowance(address(this), address(0x44444))); // 0
    usdt.approve(address(0x44444), uint256(1));
  }
}
