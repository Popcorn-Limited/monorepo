// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;
import { Test } from "forge-std/Test.sol";
import { Math } from "openzeppelin-contracts/utils/math/Math.sol";
import { MockERC20 } from "./utils/mocks/MockERC20.sol";
import { MultiRewardEscrow, Escrow, IERC20 } from "../src/utils/MultiRewardEscrow.sol";
import { SafeCastLib } from "solmate/utils/SafeCastLib.sol";

contract Tester is Test {
  uint256[4][2] nums;

  function setUp() public {
    nums[0] = [0, 1, 2, 3];
    nums[1] = [4, 5, 6, 7];
  }

  function test_sth() public {
    for (uint256 i; i < nums.length; i++) {
      emit log_uint(nums[i][0]);
    }
  }
}
