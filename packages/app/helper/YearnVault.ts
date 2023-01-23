export default interface YearnVault {
  inception: number;
  address: string;
  symbol: string;
  name: string;
  display_name: string;
  icon: string;
  token: {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
    display_name: string;
    icon: string;
  };
  tvl: {
    total_assets: number;
    price: number;
    tvl: number;
  };
  apy: {
    type: string;
    gross_apr: number;
    net_apy: number;
    fees: {
      performance: number;
      withdrawal: number;
      management: number;
      keep_crv: number;
      cvx_keep_crv: number;
    };
    points: {
      week_ago: number;
      month_ago: number;
      inception: number;
    };
    composite: null | {
      currentBoost: number;
      boostedApy: number;
      totalApy: number;
      poolApy: number;
      baseApy: number;
    };
  };
  strategies: {
    address: string;
    name: string;
  }[];
  endorsed: boolean;
  version: string;
  decimals: number;
  type: string;
  emergency_shutdown: boolean;
  updated: number;
  migration: null | {
    available: boolean;
    address: string;
  };
  special: boolean;
}
