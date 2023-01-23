use crate::file;
use clap::Parser;
use serde_json::{Map, Value};

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]

pub struct CombineArgs {
    combine: String,

    #[arg(short = 'i', long)]
    inputs: String,

    #[arg(short, long)]
    out: String,
}

pub fn run() {
    let args = CombineArgs::parse();
    let files = args.inputs.split(",").collect::<Vec<&str>>();

    let mut map = Map::new();

    files.iter().for_each(|input| {
        let file = file::open::<serde_json::Map<String, Value>>(input);
       
        map.insert(
            file.get("chainId").unwrap().as_str().unwrap().to_string(),
            serde_json::Value::Object(create_addresses_mapping(file)),
        );
    });

    file::write(&args.out, &serde_json::to_string_pretty(&map).unwrap());
}

// will create a mapping of addresses to contract metadata
fn create_addresses_mapping(mut file: Map<String, Value>) -> Map<String, Value> {
    match file.get("contracts") {
        Some(contracts) => {
            
            contracts.clone().as_object().iter().for_each(|&contract| {
                contract.iter().for_each(|(_, value)| {
                    match value.get("address") {
                        Some(address) => {
                           
                            file["contracts"].as_object_mut().unwrap().insert(address.to_string().replace("\"",""), value.clone());
                          
                        }
                        None => { println!("keyword address not found in: {:?}", contract);}
                    }
                });
               
            })

        }
        None => {
            println!("No contracts found in file");
        }
    }
    return file;
}

