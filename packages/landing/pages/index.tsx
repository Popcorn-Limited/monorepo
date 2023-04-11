import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import AuditSection from "components/AuditSection";
import ProductsSection from "components/ProductsSection";
import VideoSection from "components/VideoSection";
import InitialScreen from "components/InitialScreen";
import Footer from "components/Footer";
import VaultCraftSection from "components/VaultCraftSection";

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (window.location.pathname !== "/") {
      router.replace(window.location.pathname);
    }
  }, [router.pathname]);

  return (
    <div className="absolute left-0 flex flex-col">
      <InitialScreen />
      <VideoSection />
      <ProductsSection />
      <AuditSection />
      <VaultCraftSection />
      <Footer />
    </div >

  );
};

export default IndexPage;
