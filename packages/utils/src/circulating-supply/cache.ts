import fs from "fs";
import path from "path";

export const cache = {
  default: function () {
    return { lastBlock: 0, holders: [] };
  },
  holdersPath: function (chainId) {
    return path.resolve(__dirname, "holders", `${chainId}-holders.json`);
  },
  path: function (filename) {
    return path.resolve(__dirname, "holders", filename);
  },
  exists: function (chainId) {
    return fs.existsSync(this.holdersPath(chainId));
  },
  get: function (chainId) {
    return this.exists(chainId) ? JSON.parse(fs.readFileSync(this.holdersPath(chainId), "utf8")) : this.default();
  },
  write: function (holders, chainId, endBlock) {
    const contents = JSON.stringify({ lastBlock: endBlock, holders });
    fs.writeFileSync(this.holdersPath(chainId), contents);
  },
  writeCs: function (amount) {
    const contents = JSON.stringify({ updatedAt: new Date().toISOString(), circulatingSupply: amount });
    fs.writeFileSync(this.path("circulating-supply.json"), contents);
  },
};
export default cache;
