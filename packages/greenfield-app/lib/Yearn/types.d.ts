export type YDaemonVaultMetadata = {
  address: string;
  symbol: string;
  name: string;
  version: string;
  display_name: string;
  icon: string;
  type: "Automated" | "Standard" | "Experimental";
  tvl: {
    total_assets: number;
    price: number;
    tvl: number;
  };
  apy: {
    type: string;
    gross_apr: number;
    net_apy: number;
  };
  token: {
    address: string;
  };
};
