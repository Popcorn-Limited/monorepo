// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;
import { Test } from "forge-std/Test.sol";

struct Sample {
  address addr;
  uint256 num;
}

contract Sampler {
  Sample[2] public samples;

  event log(uint256);

  function setSample(Sample[2] memory _samples) public {
    for(uint256 i; i < _samples.length; i++) {
      samples[i] = _samples[i];
    }
  }
}

contract Tester is Test {
  Sampler public sampler = new Sampler();

  function setUp() public {}

  function test_smth() public {
    Sample[2] memory samples;
    samples[0] = Sample({addr: address(0x1), num: 1});
    samples[1] = Sample({addr: address(0x2), num: 2});
    sampler.setSample(samples);
  }
}
