import useRestakeAlert from "@popcorn/greenfield-app/hooks/useRestakeAlert";
import Footer from "@popcorn/greenfield-app/components/Footer";
import Navbar from "@popcorn/greenfield-app/components/NavBar/NavBar";
import useSubscribeToNewsletter from "@popcorn/greenfield-app/hooks/useSubscribeToNewsletter";
import React from "react";
import { Toaster } from "react-hot-toast";
import useTermsCheck from "@popcorn/greenfield-app/hooks/useTermsCheck";
import { useRouter } from "next/router";
import NoSSR from "react-no-ssr";

interface PageProps {
  children: JSX.Element;
}

export default function Page({ children }: PageProps) {
  useRestakeAlert();
  useSubscribeToNewsletter();
  useTermsCheck();

  const { pathname } = useRouter();

  const compactRoutes = ["/portfolio", "/sweet-vaults"];

  return (
    <div className="w-full md:w-10/12 laptop:w-11/12 2xl:w-8/12 mx-auto min-h-screen h-full font-khTeka flex flex-col justify-between">
      <NoSSR>
        <Navbar />
      </NoSSR>
      <Toaster position="top-right" />
      <div
        className={`pt-5 md:pt-10 md:px-8 ${compactRoutes.includes(pathname) ? "" : "px-6"}`}
      >
        {children}
      </div>
      <Footer />
    </div >
  );
}
