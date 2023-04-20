import { FC } from "react";
import LoadingSpinner from "@popcorn/greenfield-app/components/LoadingSpinner";

const PageLoader: FC = () => {
  return (
    <div className="mx-auto w-full h-full flex flex-row justify-center text-center items-center">
      <LoadingSpinner />
    </div>
  );
};
export default PageLoader;
