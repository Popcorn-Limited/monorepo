use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

#[derive(Serialize, Deserialize, Debug)]
pub struct NamedAccount {
    pub addresses: Map<String, Value>,
    pub metadata: Option<Map<String, Value>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Contract {
    pub address: Option<Value>,
    pub metadata: Option<Map<String, Value>>,
    pub abi: Option<Vec<Value>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[allow(non_snake_case)]
pub struct Deployments {
    pub chainId: String,
    pub name: String,
    pub contracts: Map<String, Value>,
}

impl Deployments {
    pub fn get_contract(&self, name: &str) -> Option<Contract> {
        let contract = self.contracts.get(name)?;
        let contract = serde_json::from_value(contract.clone()).unwrap();
        Some(contract)
    }
}
