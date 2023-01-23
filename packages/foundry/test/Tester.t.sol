// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { Test } from "forge-std/Test.sol";

struct Rights {
  bool endorsed;
  bool rejected;
}

contract Reg {
  mapping(address => Rights) public rightStructs;
  mapping(address => bool[2]) public rightArrays;

  function setStruct(address addr, bool endorsed, bool rejected) public {
    rightStructs[addr] = Rights(endorsed, rejected);
  }

  function setArray(address addr, bool endorsed, bool rejected) public {
    rightArrays[addr][0] = endorsed;
    rightArrays[addr][1] = rejected;
  }

  function getStruct(address addr) public view returns (Rights memory) {
    return rightStructs[addr];
  }

  function getStructBool(address addr, bool getEndorse) public view returns (bool) {
    return getEndorse ? rightStructs[addr].endorsed : rightStructs[addr].rejected;
  }

  function getArray(address addr) public view returns (bool[2] memory) {
    return rightArrays[addr];
  }

  function getArrayBool(address addr, bool getEndorse) public view returns (bool) {
    return getEndorse ? rightArrays[addr][0] : rightArrays[addr][1];
  }
}

contract Tester is Test {
  Reg reg;

  function setUp() public {
    reg = new Reg();
  }

  function test_costStruct() public {
    reg.setStruct(address(this), true, false);
    Rights memory rights = reg.getStruct(address(this));
    reg.getStructBool(address(this), false);
  }

  function test_costArray() public {
    reg.setArray(address(this), true, false);
    bool[2] memory arr = reg.getArray(address(this));
    reg.getArrayBool(address(this), false);
  }
}
