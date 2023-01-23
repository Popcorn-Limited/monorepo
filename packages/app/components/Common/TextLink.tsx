import { ArrowCircleRightIcon } from "@heroicons/react/outline";
import useNetworkName from "@popcorn/app/hooks/useNetworkName";
import Link from "next/link";

interface TextLinkProps {
  text: string;
  url: string;
  textSize?: string;
  showArrow?: boolean;
  outsideLink?: boolean;
  openInNewTab?: boolean;
}

export default function TextLink({
  text,
  url,
  textSize = "text-md",
  showArrow = true,
  outsideLink,
  openInNewTab,
}: TextLinkProps) {
  const networkName = useNetworkName();
  return (
    <Link
      href={outsideLink ? url : `/${networkName}${url}`}
      passHref
      className={`flex flex-shrink-0 font-medium text-primary hover:text-black whitespace-nowrap`}
      target={openInNewTab ? "_blank" : "_self"}
    >
      {text}
      {showArrow && <ArrowCircleRightIcon height={18} className="inline self-center ml-2" />}
    </Link>
  );
}
