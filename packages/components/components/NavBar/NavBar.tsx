import React, { useEffect } from "react";
import DesktopMenu from "@popcorn/components/components/NavBar/DesktopMenu";
import { MobileMenu } from "@popcorn/components/components/NavBar/MobileMenu";
import { useDisconnect, useNetwork } from "wagmi";

export default function Navbar(): JSX.Element {
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (chain?.unsupported) {
      disconnect();
    }
  }, [chain]);

  return (
    <>
      <nav className="hidden md:flex bg-white z-10 font-landing">
        <DesktopMenu />
      </nav>
      <nav className="md:hidden w-screen h-full relative">
        <MobileMenu />
      </nav>
    </>
  );
}
