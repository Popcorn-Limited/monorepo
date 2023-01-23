export default function MobileExcuseAlert(): JSX.Element {
  return (
    <div className="lg:hidden">
      <div className="w-full h-screen sm:min-h-256 relative overflow-hidden">
        <div className="w-full text-center z-20 mt-4">
          <div className="flex justify-center mb-24">
            <img src="/images/textLogo.png" alt="bgError" className="w-1/3 z-10" />
          </div>
          <h1 className="text-3xl 2xl:text-5xl font-bold md:w-1/2 2xl:w-5/12 text-center mx-auto z-20">
            This site is not yet available on mobile.
          </h1>
          <div className="z-20 mx-auto w-10/12 md:w-1/2 justify-center flex">
            <div className="flex flex-row">
              <p className="mt-4 xl:mt-8 text-2xl 2xl:text-4xl font-light z-20">
                Follow our
                <a
                  className="font-bold text-2xl 2xl:text-4xl cursor-pointer z-20 mt-8 ml-2"
                  href="https://discord.gg/RN4VGqPDwX"
                  target="_blank"
                >
                  Discord
                </a>{" "}
                and
                <a
                  className="font-bold text-2xl 2xl:text-4xl cursor-pointer z-20 mt-8 ml-2"
                  href="https://twitter.com/popcorn_DAO"
                  target="_blank"
                >
                  Twitter
                </a>{" "}
                to stay updated!
              </p>
            </div>
          </div>
        </div>
        <img src="/images/mobileErrorBg.svg" alt="bgMobileError" className="absolute bottom-0 inset-x-0 -z-10 w-full" />
      </div>
    </div>
  );
}
