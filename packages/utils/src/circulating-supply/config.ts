export const POP = {
  ethereum: {
    address: "0xd0cd466b34a24fcb2f87676278af2005ca8a78c4",
    genesis: 12237970,
  },
  polygon: {
    address: "0xc5b57e9a1e7914fda753a88f24e5703e617ee50c",
    genesis: 21006656,
  },
  arbitrum: {
    address: "0x68ead55c258d6fa5e46d67fc90f53211eab885be",
    genesis: 2868022,
  },
  bnb: {
    address: "0xE8647Ea19496E87c061bBAD79f457928b2F52b5a",
    genesis: 15293501,
  },
};

export const EXCLUDED_ADDRESSES = [
  "0xeEE1d31297B042820349B03027aB3b13a9406184", // popLocker - mainnet
  "0xe8af04AD759Ad790Aa5592f587D3cFB3ecC6A9dA", // popLocker - polygon
  "0x58db57f59dfeb70d69b9b448ff50d89b3c0a2c5f", // airdrop wallet
  "0xe88f387aedb091b6c57136c5eea20644906a3fac", // popstar multisig
  "0x50c8194cad3c7b19b0d220385c51e70024f63543", // partner wallet
  "0xf18f64F958b078FEaCADBC2eDE89c09A7e954116", // team wallet
  "0x084e8A8cF1C38dEF1D6dB8542a73aa0d54284F8D", // foundation wallet
  "0x0ec6290abb4714ba5f1371647894ce53c6dd673a", // dao treasury - mainnet
  "0x0C0991CB6e1c8456660A49aa200B71de6158b85C", // rewards escrow - arb & bnb
  "0xb5cb5710044D1074097c17B7535a1cF99cBfb17F", // rewards escrow - mainnet
  "0xa82cAA79F35f7d6B6f1EC1971878F3474C894565", // rewards escrow - polygon
  "0xA50608894E7AdE9216C2fFe14E17c73835CEe0B3", // rewards distribution
  "0x6E5fB0B93ac840bE24e768F3D87cCE7503A29488", // dao multisig - arbitrum
  "0xa49731448a1b25d92F3d80f3d3025e4F0fC8d776", // dao multisig - polygon
  "0x50a7c5a2aa566eb8aafc80ffc62e984bfece334f", // token manager
  "0x99c9fc46f92e8a1c0dec1b1747d010903e884be1", // optimism bridge
  "0x533e3c0e6b48010873b947bddc4721b1bdff9648", // bnb bridge
  "0xa3a7b6f88361f48403514059f1f16c8e78d60eec", // arbitrum bridge
  "0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf", // polygon bridge
  "0x94f58dc6bf565c6b27de5caef3a292dcc3522ebd", // xpop redemption (bnb & arbitrum)
  "0x48168536fc8834a9543c5a4383721148113ff75a", // xpop redemption (polygon)
  "0x0000000000000000000000000000000000000000", // xero address
  "0x000000000000000000000000000000000000dead", // dead address
]
  .map((address) => address.toLowerCase())
  .reduce((addresses, address) => ({ ...addresses, [address]: true }), {}); // convert to object map to reduce iterations
