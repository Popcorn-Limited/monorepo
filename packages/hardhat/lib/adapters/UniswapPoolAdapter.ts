import { parseEther } from "@ethersproject/units";
import { BigNumber, Contract } from "ethers";

class UniswapPoolAdapter {
  constructor(private contract: Contract) {}

  async getTokenPrice(returnPrice0 = false): Promise<BigNumber> {
    const slot = await this.contract.slot0();

    //Amount of Token1 your get for Token0
    //E.G. 1 USDC = 0.95 POP
    const price0 = slot[0].pow(2).div(BigNumber.from("2").pow(192)).mul("1000000"); // raise to get to 1e18
    if (returnPrice0) {
      return price0;
    }
    //Amount of Token0 your get for Token1
    //E.G. 1 POP = 1.04 USDC
    return parseEther("2").sub(price0);
  }
}
export default UniswapPoolAdapter;
