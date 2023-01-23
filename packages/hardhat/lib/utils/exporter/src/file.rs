use std::fs::File;
use std::io::Read;
use std::io::Write;

use serde::Deserialize;

pub fn open<T: for<'a> Deserialize<'a>>(filename: &str) -> T {
    let mut file = File::open(filename).unwrap_or_else(|_| panic!("File not found: {}", filename));
    let mut data = String::new();

    file.read_to_string(&mut data).unwrap();
    return serde_json::from_str(&data).expect("JSON was not well-formatted");
}

pub fn write(filepath: &str, contents: &str) {
    let mut file = File::create(&filepath).unwrap();
    file.write_all(&contents.as_bytes()).unwrap();
}
