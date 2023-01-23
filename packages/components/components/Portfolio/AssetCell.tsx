export default function AssetCell({
  children,
  as: Wrapper = "td",
  className,
}: {
  children: any;
  as?: any;
  className?: string;
}) {
  return (
    <Wrapper
      className={`text-primary text-sm md:text-lg font-medium md:bg-customLightGray md:bg-opacity-[10%] px-2 md:py-4 ${className}`}
    >
      {children}
    </Wrapper>
  );
}
