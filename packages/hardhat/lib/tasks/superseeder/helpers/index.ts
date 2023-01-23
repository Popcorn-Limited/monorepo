const web3 = require("web3");

export const toWei = (num, unit) => web3.utils.toWei(num.toString(), unit);

export const chunkArray = (myArray, chunk_size) => {
  var results = [];
  while (myArray.length) {
    results.push(myArray.splice(0, chunk_size));
  }
  return results;
};

/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX adress
 * @return {Boolean}
 */
export const isAddress = function (address) {
  return web3.utils.isAddress(address);
};
