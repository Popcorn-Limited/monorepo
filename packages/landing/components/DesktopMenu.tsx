
import MainActionButton from "@popcorn/app/components/MainActionButton";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useRef, useState, Fragment, useCallback } from "react";

export default function DesktopMenu(): JSX.Element {
  const router = useRouter();
  const [menuVisible, toggleMenu] = useState<boolean>(false);

  return (
    <>
      <div className="flex flex-row items-center justify-between w-full p-8 z-30 ">
        <div className="flex flex-row items-center">
          <div>
            <Link href={`/`} passHref>
              <img src="/images/icons/popLogo.svg" alt="Logo" className="w-10 h-10" />
            </Link>
          </div>
        </div>
        <div className="flex w-fit">
          <MainActionButton label="Launch app" handleClick={() => { }} />
        </div>
      </div>
    </>
  );
}
