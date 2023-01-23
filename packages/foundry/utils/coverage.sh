#!/usr/bin/env bash

set -euo pipefail

main() {
  forge coverage --report lcov
  lcov -o lcov.info \
  --remove lcov.info \
  --rc lcov_branch_coverage=1 \
  --rc lcov_function_coverage=1 \
    "test/*" "../../node_modules/*"
  mkdir -p coverage
  genhtml -o coverage lcov.info \
  --branch-coverage \
  --legend
}


main
