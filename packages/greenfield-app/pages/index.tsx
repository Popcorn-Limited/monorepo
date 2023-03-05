import Products from "@popcorn/components/components/landing/Products";
import SecuritySection from "@popcorn/app/components/landing/SecuritySection";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Hero from "@popcorn/greenfield-app/components/landing/Hero";

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (window.location.pathname !== "/") {
      router.replace(window.location.pathname);
    }
  }, [router.pathname]);
  return (
    <main>
      <Hero />
      <Products />
      <SecuritySection />
    </main>
  );
};

export default IndexPage;
