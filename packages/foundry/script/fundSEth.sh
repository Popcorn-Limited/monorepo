#!/usr/bin/env bash

cast rpc anvil_impersonateAccount 0x5aD00b0DB3019E1ab09c25179e27a42e9315E050 --rpc-url localhost:8545 && cast send 0x06325440D014e39736583c165C2963BA99fAf14E --rpc-url localhost:8545 \
--from 0x5aD00b0DB3019E1ab09c25179e27a42e9315E050 \
  "transfer(address,uint256)(bool)" \
  0xa0Ee7A142d267C1f36714E4a8F75612F20a79720 \
  1000000000000000000000 && cast send 0x06325440D014e39736583c165C2963BA99fAf14E --rpc-url localhost:8545 \
--from 0x5aD00b0DB3019E1ab09c25179e27a42e9315E050 \
  "transfer(address,uint256)(bool)" \
  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 \
  1000000000000000000000