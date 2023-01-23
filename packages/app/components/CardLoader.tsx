import React from "react";
import ContentLoader from "react-content-loader";
export const CardLoader: React.FC = () => {
  return (
    <ContentLoader viewBox="0 0 450 400" backgroundColor={"#EBE7D4"} foregroundColor={"#d7d5bc"}>
      {/*eslint-disable */}
      <rect x="0" y="0" rx="8" ry="8" width="450" height="108" />
      <rect x="0" y="115" rx="8" ry="8" width="450" height="108" />
      <rect x="0" y="230" rx="8" ry="8" width="450" height="108" />
      {/*eslint-enable */}
    </ContentLoader>
  );
};
