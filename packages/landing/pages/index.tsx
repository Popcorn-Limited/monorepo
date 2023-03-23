import { useRouter } from "next/router";
import React, { useEffect } from "react";
import NoSSR from "react-no-ssr";

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (window.location.pathname !== "/") {
      router.replace(window.location.pathname);
    }
  }, [router.pathname]);
  return (
    <main>
      <NoSSR>
        <div>
          <p>code here</p>
        </div>
      </NoSSR>
    </main>
  );
};

export default IndexPage;
