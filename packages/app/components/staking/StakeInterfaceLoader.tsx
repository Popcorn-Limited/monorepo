import ContentLoader from "react-content-loader";

export default function StakeInterfaceLoader(): JSX.Element {
  return (
    <>
      <div className="grid grid-cols-12 gap-8 mt-14">
        <div className="col-span-12 md:col-span-5">
          <ContentLoader speed={1} viewBox="0 0 500 84" backgroundColor={"#EBE7D4"} foregroundColor={"#d7d5bc"}>
            <rect x="0" y="0" rx="8" ry="8" width="90%" height="22" />
            <rect x="0" y="33" rx="8" ry="8" width="108" height="13" />
            <rect x="129" y="33" rx="8" ry="8" width="60" height="13" />
            <rect x="196" y="33" rx="8" ry="8" width="60" height="13" />
          </ContentLoader>
        </div>

        <div className="col-span-12 md:col-span-3 md:col-end-13 hidden md:flex justify-end items-end">
          <ContentLoader viewBox="0 0 450 450" backgroundColor={"#EBE7D4"} foregroundColor={"#d7d5bc"}>
            <rect x="0" y="0" rx="8" ry="8" width="450" height="450" />
          </ContentLoader>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-y-8 md:gap-8 mt-6 md:mt-10">
        <div className="col-span-12 md:col-span-5">
          <ContentLoader viewBox="0 0 450 600" backgroundColor={"#EBE7D4"} foregroundColor={"#d7d5bc"}>
            <rect x="0" y="0" rx="8" ry="8" width="450" height="600" />
          </ContentLoader>
        </div>

        <div className="col-span-12 md:col-span-7">
          <ContentLoader viewBox="0 0 450 400" backgroundColor={"#EBE7D4"} foregroundColor={"#d7d5bc"}>
            <rect x="0" y="0" rx="8" ry="8" width="450" height="108" />
            <rect x="0" y="115" rx="8" ry="8" width="450" height="216" />
          </ContentLoader>
        </div>
      </div>
    </>
  );
}
