import { expect } from "chai";
import { BigNumber, Contract, ContractTransaction } from "ethers";
import { parseEther } from "ethers/lib/utils";

export async function expectRevert(call: any, revertReason: string): Promise<Chai.AsyncAssertion> {
  return expect(call).to.be.revertedWith(revertReason);
}

export async function expectEvent(
  call: ContractTransaction,
  contract: Contract,
  event: string,
  params: any[]
): Promise<Chai.AsyncAssertion> {
  return expect(call)
    .to.emit(contract, event)
    .withArgs(...params);
}

export async function expectNoEvent(
  call: ContractTransaction,
  contract: Contract,
  event: string
): Promise<Chai.AsyncAssertion> {
  return expect(call).to.not.emit(contract, event);
}

export function expectValue(value: any, expectedValue: any): Chai.Assertion {
  return expect(value).to.equal(expectedValue);
}

export async function expectStruct(struct: object, expectedStruct: object): Promise<Chai.AsyncAssertion> {
  expect(JSON.stringify(struct)).to.deep.equal(JSON.stringify(expectedStruct));
}

export async function expectBigNumberCloseTo(
  value: BigNumber,
  expectedValue: BigNumber,
  delta?: BigNumber
): Promise<Chai.AsyncAssertion> {
  delta = delta ? delta : parseEther("0.00015");
  const difference = expectedValue.sub(value);
  if (difference.abs().gt(delta)) {
    expect.fail(difference, delta, `Expected ${value} to be within ${delta} of ${expectedValue}`);
  }
}

export async function expectDeepValue(value: any[], expectedValue: any[]): Promise<Chai.AsyncAssertion> {
  expect(value).to.deep.equal(expectedValue);
}
