mod cli;
mod combine;
mod create_deployment;
mod deployments;
mod file;
mod merge;

fn main() {
    let matches = cli::cli().get_matches();

    match matches.subcommand() {
        Some(("create-deployment", _sub_matches)) => create_deployment::run(),
        Some(("merge", _sub_matches)) => {
            merge::run();
        }
        Some(("combine", _sub_matches)) => {
            combine::run();
        }
        _ => unreachable!(),
    }
}
