const ErrorPage = () => {
  return (
    <div className="w-full h-screen bg-primaryLight overflow-hidden">
      <div className="w-full text-center z-20 mt-24">
        <h1 className="text-4xl 2xl:text-7xl font-medium md:w-1/2 2xl:w-5/12 text-center mx-auto">
          Please <span className="font-semibold">sign terms and conditions</span> to use this Dapp.
        </h1>
        <div className="z-20 mx-auto w-10/12 md:w-1/2 justify-center flex">
          <div className="flex flex-row">
            <p className="mt-4 xl:mt-8 text-2xl 2xl:text-4xl font-light z-20">
              Follow our
              <a
                className="font-medium text-2xl 2xl:text-4xl cursor-pointer z-20 mt-8 ml-2"
                href="https://discord.gg/RN4VGqPDwX"
                target="_blank"
              >
                Discord
              </a>{" "}
              and
              <a
                className="font-medium text-2xl 2xl:text-4xl cursor-pointer z-20 mt-8 ml-2"
                href="https://twitter.com/popcorn_DAO"
                target="_blank"
              >
                Twitter
              </a>{" "}
              for more information!
            </p>
          </div>
        </div>
        <div className="z-20 mx-auto w-10/12 md:w-1/2 justify-center flex">
          <div className="flex flex-row">
            <p className="mt-4 xl:mt-8 text-2xl 2xl:text-4xl font-light z-20 block">
              <a className="font-medium text-2xl 2xl:text-4xl cursor-pointer z-20 mt-8 ml-2" href={`/`}>
                Go back
              </a>{" "}
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <img src="/images/errorBackground.svg" alt="bgError" className="absolute bottom-0 -z-100 max-w-full h-4/6" />
      </div>
    </div>
  );
};

export default ErrorPage;
