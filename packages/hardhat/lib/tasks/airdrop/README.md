# Airdrop tasks

## `airdrop:create`
Creates a new airdrop distribution using the Balancer [`MerkleOrchard`](https://docs.balancer.fi/products/merkle-orchard),
a public contract for Merkle airdrop distributions. You must provide the address of an ERC20 token to distribute, a
sequential integer ID to identify the distribution, and a path to a JSON file containing distribution amounts by address.

The format of the balances file is:

```json
{
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266": "100",
  "0x70997970c51812dc3a010c7d01b50e0d17dc79c8": "250"
}
```

With one entry per unique address. Note that balances are denominated in units of `ether`, i.e. 10<sup>18</sup> wei.

This task will generate a Merkle tree from the provided balances, calculate the number of tokens required for the
distribution, approve transfer of these tokens to the `MerkleOrchard` contract, and create a new distribution using the
generated Merkle root.

| Argument      | Type    | Description                                                                 |
| ------------- | ------- | --------------------------------------------------------------------------- |
| token         | Address | Address of the ERC20 token to be distributed in the airdrop.                |
| id            | Integer | Integer ID for this distribution. Must be sequential for each distribution. | 
| balances-file | String  | Path to a JSON file containing distribution amounts by address.             |