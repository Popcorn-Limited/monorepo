use clap::Command;

pub fn cli() -> Command {
    Command::new("exporter")
        .about("A tool to create deployment files from namedAccounts")
        .subcommand_required(true)
        .arg_required_else_help(true)
        .allow_external_subcommands(true)
        .subcommand(
            Command::new("create-deployment")
                .about("creates a deployment file from named accounts")
                .arg(
                    clap::Arg::new("named_accounts")
                        .short('t')
                        .long("named-accounts")
                        .help("path to named accounts file")
                        .required(true)
                )
                .arg(
                    clap::Arg::new("network")
                        .short('n')
                        .long("network")
                        .help("network to use")
                        .required(true)
                ).arg(
                    clap::Arg::new("out")
                        .short('o')
                        .long("out")
                        .help("path to output file")
                        .required(true)
                ).arg(
                    clap::Arg::new("chain-id")
                        .short('c')
                        .long("chain-id")
                        .help("chain id")
                        .required(true)
                ),

        ).subcommand(  Command::new("merge")
        .about("merges hardhat generated deployment and namedAccounts into single deployment file")
        .arg(
            clap::Arg::new("network")
                .short('n')
                .long("network")
                .help("network to use")
                .required(true)
        ).arg(
            clap::Arg::new("out")
                .short('o')
                .long("out")
                .help("path to output file")
                .required(true)
        ).arg(
            clap::Arg::new("inputs")
                .short('i')
                .long("inputs")
                .help(" input filepath - comma delimited list of deployment files to merge")
                .required(true)
        ).arg(
            clap::Arg::new("abi")
                .long("abi")
                .help("include abi in output")
                .required(false)
        ).arg(
            clap::Arg::new("chain_id")
                .long("chain-id")
                .short('c')
                .help("chain id")
                .required(true)
        )
    ).subcommand(  Command::new("combine")
    .about("combines merged files into one")
    .arg(
        clap::Arg::new("out")
            .short('o')
            .long("out")
            .help("path to output file")
            .required(true)
    ).arg(
        clap::Arg::new("inputs")
            .short('i')
            .long("inputs")
            .help(" input filepath - comma delimited list of deployment files to merge")
            .required(true)
    ))
}
