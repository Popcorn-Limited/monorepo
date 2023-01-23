module.exports = {
  mocha: {
    grep: "@skip-on-coverage", // Find everything with this tag
    invert: true, // Run the grep's inverse set.
  },
  measureStatementCoverage: false,
  configureYulOptimizer: true,
  skipFiles: [
    "core/defi/pool/AffiliateToken.sol",
    "test_helpers/",
    "mocks/",
    "externals/",
    "lbp/",
    "core/dao",
    "core/libraries/",
    "test_helpers/",
    "core/interfaces/",
    "core/utils/RandomNumberConsumer.sol",
    "core/utils/Owned.sol",
    "core/utils/Superseeder.sol",
  ],
};
