use crate::{deployments::Deployments, file};
use clap::Parser;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]

pub struct CreateDeploymentArgs {
    create_deployment: String,

    #[arg(short = 'a', long)]
    named_accounts: String,

    #[arg(short = 'n', long)]
    network: String,

    #[arg(short, long)]
    out: String,

    #[arg(short, long, default_value_t)]
    chain_id: String,
}

fn _network(args: &CreateDeploymentArgs) -> std::string::String {
    return args.network.clone();
}

#[derive(Serialize, Deserialize, Debug)]

struct Contract {
    address: Value,
    abi: Value,
    metadata: Value,
}

fn _contract(contract: &Value, network: &String) -> Contract {
    return Contract {
        address: match contract.get("addresses").is_some()
            && contract.get("addresses").unwrap().get(&network).is_some()
        {
            true => contract
                .get("addresses")
                .unwrap()
                .get(&network)
                .unwrap()
                .clone(),
            false => "".to_string().into(),
        },
        abi: contract["abi"].clone(),
        metadata: contract["metadata"].clone(),
    };
}
pub fn run() {
    let args = CreateDeploymentArgs::parse();
    let mut deployments: Map<String, Value> = Map::new();

    file::open::<serde_json::Map<String, Value>>(&args.named_accounts)
        .iter()
        .for_each(|(alias, contract)| {
            if contract.get("addresses").is_some()
                && contract
                    .get("addresses")
                    .unwrap()
                    .get(&args.network)
                    .is_some()
            {
                let contract = _contract(contract, &args.network);
                deployments.insert(
                    alias.clone(),
                    serde_json::to_string(&contract).unwrap().parse().unwrap(),
                );
            }
        });

    file::write(
        &args.out,
        serde_json::to_string_pretty(&Deployments {
            chainId: args.chain_id,
            name: args.network.clone().to_string(),
            contracts: deployments,
        })
        .unwrap()
        .as_str(),
    );
}
