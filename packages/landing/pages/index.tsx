import { useRouter } from "next/router";
import React, { useEffect } from "react";
import AuditSection from "components/AuditSection";
import ProductsSection from "components/ProductsSection";
import VideoSection from "components/VideoSection";
import InitialScreen from "components/InitialScreen";
import Footer from "components/Footer";

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
      <Footer />
    </div >

  );
};

export default IndexPage;
