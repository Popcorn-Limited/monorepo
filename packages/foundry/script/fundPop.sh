#!/usr/bin/env bash

cast rpc anvil_impersonateAccount 0x719a363735dFa5023033640197359665072b8C0E --rpc-url localhost:8545 && cast send 0xD0Cd466b34A24fcB2f87676278AF2005Ca8A78c4 --rpc-url localhost:8545 \
--from 0x719a363735dFa5023033640197359665072b8C0E \
  "transfer(address,uint256)(bool)" \
  0xa0Ee7A142d267C1f36714E4a8F75612F20a79720 \
  1000000000000000000000