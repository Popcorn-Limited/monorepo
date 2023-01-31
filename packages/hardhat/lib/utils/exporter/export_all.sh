#! /bin/bash

if [ "$CI" = "true" ]; then
echo "Using CI exporter"
EXPORTER=./musl-exporter
else
echo "Using local exporter"
EXPORTER=./target/release/exporter
fi

FOUNDRY_DEPLOYMENT=$3
echo "$FOUNDRY_DEPLOYMENT"
NAMED_ACCOUNTS=../namedAccounts.json
OUT_DIR=out

# yarn dev will run a local node and deployment. that command saves the deployment artifact to this location and is read by the exporter so it should not be necessary to ever have to manually input deployed addresses into namedAccounts.json 
if [ ! -f "$OUT_DIR/hardhat-deployment.json" ] 
then
$EXPORTER create-deployment --named-accounts $NAMED_ACCOUNTS -n hardhat -c 1337  -o $OUT_DIR/hardhat-deployment.json
fi

$EXPORTER create-deployment --named-accounts $NAMED_ACCOUNTS -n mainnet -c 1  -o $OUT_DIR/mainnet-deployment.json
$EXPORTER create-deployment --named-accounts $NAMED_ACCOUNTS -n polygon -c 137  -o $OUT_DIR/polygon-deployment.json
$EXPORTER create-deployment --named-accounts $NAMED_ACCOUNTS -n bsc -c 56  -o $OUT_DIR/bsc-deployment.json
$EXPORTER create-deployment --named-accounts $NAMED_ACCOUNTS -n arbitrum -c 42161  -o $OUT_DIR/arbitrum-deployment.json
$EXPORTER create-deployment --named-accounts $NAMED_ACCOUNTS -n rinkeby -c 4  -o $OUT_DIR/rinkeby-deployment.json
$EXPORTER create-deployment --named-accounts $NAMED_ACCOUNTS -n goerli -c 5  -o $OUT_DIR/goerli-deployment.json
$EXPORTER create-deployment --named-accounts $NAMED_ACCOUNTS -n optimism -c 10  -o $OUT_DIR/optimism-deployment.json

# this merges mainnet namedAccounts into hardhat namedAccounts so that local deploys can use forked addresses
$EXPORTER merge --inputs $NAMED_ACCOUNTS,$OUT_DIR/hardhat-deployment.json --network mainnet --out $OUT_DIR/hardhat-merge.json -c 1337

if [ "$1" = "foundry" ]; then
if [ -z $FOUNDRY_DEPLOYMENT ]; then 
exit "path to foundry deployment file is not set, you must set it as an argument after the script like so `yarn export-foundry-deployment ../../../broadcast/ExampleDeployScript.s.sol/5/run-latest.json`"
else
if [ "$2" = "goerli" ]; then
cargo run mergefoundry --inputs $NAMED_ACCOUNTS,$FOUNDRY_DEPLOYMENT --network goerli --out $OUT_DIR/goerli-merge.json -c 5
else
cargo run mergefoundry --inputs $NAMED_ACCOUNTS,$FOUNDRY_DEPLOYMENT --network hardhat --out $OUT_DIR/hardhat-merge.json -c 1337
fi
fi
else
$EXPORTER merge --inputs $NAMED_ACCOUNTS,$OUT_DIR/polygon-deployment.json --network polygon --out $OUT_DIR/polygon-merge.json -c 137
$EXPORTER merge --inputs $NAMED_ACCOUNTS,$OUT_DIR/arbitrum-deployment.json --network arbitrum --out $OUT_DIR/arbitrum-merge.json -c 42161
$EXPORTER merge --inputs $NAMEDACCOUNTS,$OUT_DIR/mainnet-deployment.json --network mainnet --out $OUT_DIR/mainnet-merge.json -c 1
$EXPORTER merge --inputs $NAMED_ACCOUNTS,$OUT_DIR/bsc-deployment.json --network bsc --out $OUT_DIR/bsc-merge.json -c 56
$EXPORTER merge --inputs $NAMED_ACCOUNTS,$OUT_DIR/rinkeby-deployment.json --network rinkeby --out $OUT_DIR/rinkeby-merge.json -c 4
$EXPORTER merge --inputs $NAMED_ACCOUNTS,$OUT_DIR/goerli-deployment.json --network goerli --out $OUT_DIR/goerli-merge.json -c 5
$EXPORTER merge --inputs $NAMED_ACCOUNTS,$OUT_DIR/optimism-deployment.json --network optimism --out $OUT_DIR/optimism-merge.json -c 10
fi

$EXPORTER combine --inputs $OUT_DIR/hardhat-merge.json,$OUT_DIR/polygon-merge.json,$OUT_DIR/arbitrum-merge.json,$OUT_DIR/mainnet-merge.json,$OUT_DIR/bsc-merge.json,$OUT_DIR/rinkeby-merge.json,$OUT_DIR/optimism-merge.json,$OUT_DIR/goerli-merge.json --out $OUT_DIR/deployments.json

echo "exported deployments to" $PWD/$OUT_DIR/deployments.json