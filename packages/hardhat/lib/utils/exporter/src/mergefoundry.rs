use std::collections::HashMap;

use crate::deployments::{Contract, Deployments, FoundryDeployment, NamedAccount};
use crate::file;
use clap::Parser;
use serde_json::{Map, Value};

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]

pub struct MergeArgs {
    merge: String,

    #[arg(short = 'i', long)]
    inputs: String,

    #[arg(short = 'n', long)]
    network: String,

    #[arg(short, long)]
    out: String,

    #[arg(short = 'b', long, default_value_t = false)]
    abi: bool,

    #[arg(short, long)]
    chain_id: String,
}

pub fn run() {
    let args = MergeArgs::parse();

    let inputs = args.inputs.split(",").collect::<Vec<&str>>();

    let mut deployments = Deployments {
        chainId: args.chain_id,
        name: args.network.clone(),
        contracts: Map::new(),
    };

    let mut aliases: HashMap<String, String> = HashMap::new();

    let named_accounts = from_named_accounts_file(file::open::<serde_json::Map<String, Value>>(
        &inputs[0].to_string(),
    ));

    let deployments_file =
        from_deployments_file(file::open::<FoundryDeployment>(&inputs[1].to_string()));

    named_accounts.iter().for_each(|(alias, contract)| {
        let named_account: NamedAccount = serde_json::from_value(contract.clone()).unwrap();
        deployments.merge_named_accounts(&args.network, alias, &named_account);
        if named_account.is_alias() {
            aliases.insert(
                named_account.get_contract().unwrap().to_string(),
                alias.clone(),
            );
        }
    });

    deployments_file.iter().for_each(|(alias, contract)| {
        let deployment: String = serde_json::from_value(contract.clone()).unwrap();
        match aliases.get(alias) {
            Some(x) => deployments.merge_hardhat_deployment(x, &deployment),
            None => deployments.merge_hardhat_deployment(alias, &deployment),
        };
    });

    file::write(
        &args.out,
        &serde_json::to_string_pretty(&deployments).unwrap(),
    );
}

fn from_named_accounts_file(map: Map<String, Value>) -> Map<String, Value> {
    let mut named_accounts_file: Map<String, Value> = Map::new();
    map.iter().for_each(|(alias, contract)| {
        named_accounts_file.insert(alias.clone(), contract.clone());
    });
    named_accounts_file
}

fn from_deployments_file(deployment: FoundryDeployment) -> Map<String, Value> {
    let mut deployments_file: Map<String, Value> = Map::new();
    for k in &deployment.transactions {
        if k.transactionType == "CREATE" {
            // Note this may fail if we deploy a Solidity file twice in the same script
            match &k.contractName {
                Some(x) => deployments_file
                    .insert(x.clone(), serde_json::to_value(&k.contractAddress).unwrap()),
                None => None,
            };
        }
    }
    deployments_file
}

trait Alias {
    fn get_contract(&self) -> Option<&str>;
    fn is_alias(&self) -> bool;
}

impl Alias for NamedAccount {
    fn is_alias(&self) -> bool {
        match self.metadata.is_some()
            && self.metadata.as_ref().unwrap().contains_key("contractName")
        {
            true => true,
            false => false,
        }
    }
    fn get_contract(&self) -> Option<&str> {
        match self.is_alias() {
            true => self
                .metadata
                .as_ref()
                .unwrap()
                .get("contractName")
                .unwrap()
                .as_str(),
            false => None,
        }
    }
}

trait Merge {
    fn merge_named_accounts(&mut self, network: &str, key: &str, named_account: &NamedAccount);
    fn merge_hardhat_deployment(&mut self, alias: &str, hh_deployment: &str);
    fn merge_alias_deployment(&mut self, alias: &str, hh_deployment: &Contract);
}
impl Merge for Deployments {
    fn merge_hardhat_deployment(&mut self, alias: &str, deployment: &str) {
        // get contracts from contracts map: self.contracts
        // if the contract is in the deployment, then overwrite the data, otherwise fallback to stored contract address

        let _contract = self.contracts.get(alias);

        // insert metadata into contracts map
        let contract: Contract = Contract {
            address: match deployment == "lol" {
                false => Some(serde_json::to_value(&deployment).unwrap()),
                true => None,
            },
            abi: match _contract.is_some() {
                true => self.get_contract(alias).unwrap().abi.clone(),
                false => None,
            },
            metadata: match _contract.is_some() {
                true => self.get_contract(alias).unwrap().metadata.clone(),
                false => None,
            },
        };

        self.contracts
            .insert(alias.to_string(), serde_json::json!(contract));
    }

    fn merge_alias_deployment(&mut self, alias: &str, deployment: &Contract) {
        // get contracts from contracts map: self.contracts
        // if the contract is in the deployment, then overwrite the data, otherwise fallback to stored contract address

        let _contract = self.contracts.get(alias);

        // insert metadata into contracts map
        let contract: Contract = Contract {
            address: match _contract.is_some() {
                true => self.get_contract(alias).unwrap().address.clone(),
                false => None,
            },

            abi: match deployment.abi.is_some() {
                true => Some(deployment.abi.clone().unwrap()),
                false => match _contract.is_some() {
                    true => self.get_contract(alias).unwrap().abi.clone(),
                    false => None,
                },
            },
            metadata: match deployment.metadata.is_some() {
                true => Some(deployment.metadata.clone().unwrap()),
                false => match _contract.is_some() {
                    true => self.get_contract(alias).unwrap().metadata.clone(),
                    false => None,
                },
            },
        };

        self.contracts
            .insert(alias.to_string(), serde_json::json!(contract));
    }

    fn merge_named_accounts(&mut self, network: &str, key: &str, named_account: &NamedAccount) {
        let contract = Contract {
            address: match named_account.addresses.get(network).is_some() {
                true => Some(named_account.addresses.get(network).unwrap().clone()),
                false => None,
            },
            abi: None,
            metadata: match &named_account.metadata.is_some() {
                true => named_account.metadata.clone(),
                false => None,
            },
        };

        if named_account.addresses.get(network).is_some() {
            self.contracts.insert(
                key.clone().to_string(),
                serde_json::to_value(&contract).unwrap(),
            );
        }
    }
}
