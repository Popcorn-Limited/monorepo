import { FC } from "react";
import Image from "next/image";
import { ChainId, networkLogos } from "@popcorn/utils";

interface NetworkStickerProps {
  chainId?: ChainId;
}

export const NetworkSticker: FC<NetworkStickerProps> = ({ chainId }) => {
  return (
    <div className="absolute top-0 -left-2 md:-left-4">
      <div className="hidden md:block">
        <Image
          src={networkLogos[chainId]}
          alt={ChainId[chainId]}
          height="24"
          width="24"
        />
      </div>
      <div className="md:hidden">
        <Image
          src={networkLogos[chainId]}
          alt={ChainId[chainId]}
          height="12"
          width="12"
        />
      </div>
    </div>
  );
};
