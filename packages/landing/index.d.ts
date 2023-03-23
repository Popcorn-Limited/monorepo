declare global {
  interface Window {
    ethereum: any;
  }
}

declare module "*.svg" {
  import { FC, SVGProps } from "react";
  export const ReactComponent: FC<SVGProps<SVGSVGElement>>;

  const src: string;
  export default src;
}

declare module "coingecko-api" {
  import { CoinGecko } from "coingecko-api";
  export default CoinGecko;
}

window.ethereum = window.ethereum || {};
