Deployment script for Goerli:

(Note, you will have to update the addresses on these scripts before you run them)

forge script ./script/benGov/BeneficiaryGovernanceDeployment.s.sol:DeployBenGov -vvv --rpc-url <RPC_URL> --broadcast --verify



Adding nomination proposals and eligible beneficiaries:

forge script ./script/benGov/AddNominationProposal.s.sol:AddProposal --rpc-url <RPC_URL> --chain-id 5 --sender <YOUR_ADDRESS> --broadcast


forge script ./script/benGov/AddBeneficiariesToRegistry.s.sol:AddBeneficiariesToRegistry --rpc-url <RPC_URL>  --chain-id 5 --sender <YOUR_ADDRESS> --broadcast

