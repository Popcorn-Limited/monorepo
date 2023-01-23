import Lottie from "react-lottie";
import loaderAnim from "@popcorn/app/LottieAnimations/loader.json";

const LoadingSpinner = () => {
  const loaderOptions = {
    loop: true,
    autoplay: true,
    animationData: loaderAnim,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid meet",
    },
  };
  return (
    <div className="flex justify-center items-center" style={{ height: "70vh" }}>
      <Lottie options={loaderOptions} width="120px" height="120px" />
    </div>
  );
};

export default LoadingSpinner;
