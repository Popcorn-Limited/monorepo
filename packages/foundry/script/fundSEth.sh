#!/usr/bin/env bash

cast rpc anvil_impersonateAccount 0xc5424B857f758E906013F3555Dad202e4bdB4567 && cast send 0x5e74C9036fb86BD7eCdcb084a0673EFc32eA31cb \
--from 0xc5424B857f758E906013F3555Dad202e4bdB4567 \
  "transfer(address,uint256)(bool)" \
  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 \
  1000000000000000000000
