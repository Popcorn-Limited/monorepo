import type { PropsWithChildren } from "react";

function Title({
  children,
  className,
  as: ComponentWraper = "h1",
  level = 1,
  fontWeight = "font-medium",
}: PropsWithChildren<{
  /** Defaults to `h1` */
  as?: string | JSX.Element;
  className?: string;
  /** Override tw font- class. Defaults to `font-medium` */
  fontWeight?: string;
  /** Heading level */
  level?: 1 | 2;
}>) {
  const Wrapper = ComponentWraper as any;
  const headingCx = level === 1 ? "text-3xl md:text-4xl" : " text-2xl";
  return <Wrapper className={`${headingCx} ${fontWeight} ${className}`}>{children}</Wrapper>;
}

export default Title;
