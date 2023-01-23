import { parseEther, solidityKeccak256 } from "ethers/lib/utils";
const MerkleTree = require("merkle-tree-solidity").default;

export const merklize = function (elements) {
  let merkleElements = [];
  Object.entries(elements).forEach(([who, amount]) => merkleElements.push(makeElement(who, amount)));
  return new MerkleTree(merkleElements);
};

export const makeElement = function (who, amount) {
  return Buffer.from(solidityKeccak256(["address", "uint256"], [who, amount]).replace(/^0x/, ""), "hex");
};

export const generateClaims = function (accounts: string[]) {
  let claims = {};
  let split = parseEther("100").div(accounts.length).toString();
  accounts.forEach((address, i) => (claims[address] = String(split)));
  return claims;
};
