import { ChevronLeftIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import React from "react";
import NavbarLink from "@popcorn/app/components/NavBar/NavbarLinks";

const MobileProductsMenu = ({ onClose, onSelect }: { onClose?: (e: any) => void; onSelect?: (e: any) => void }) => {
  const router = useRouter();

  return (
    <div className="h-screen px-6 py-10">
      <div className="relative flex items-center justify-center">
        <ChevronLeftIcon
          className="text-black h-10 w-10 absolute -left-3 transform -translate-y-1/2 top-1/2"
          onClick={onClose}
        />
        <p className="text-black text-center font-medium">Products</p>
      </div>
      <ul className="flex flex-col gap-10 justify-center mt-24">
        <li className="mt-1">
          <NavbarLink
            onClick={onSelect}
            label="Sweet Vaults"
            url="/sweet-vaults"
            isActive={router?.pathname === `/sweet-vaults`}
          />
        </li>
        <li className="mt-1">
          <NavbarLink
            onClick={onSelect}
            label="Staking"
            url="/staking"
            isActive={router?.pathname.includes("/staking")}
          />
        </li>
      </ul>
    </div>
  );
};

export default MobileProductsMenu;
