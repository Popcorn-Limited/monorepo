
function Accordion({ children, header, initiallyOpen, containerClassName }: {children, header, initiallyOpen?: boolean, containerClassName?: string}) {
  return (
    <details
      className={`group p-8 bg-warmGray/25 rounded-2xl border border-warmGray/80 [&_summary::-webkit-details-marker]:hidden ${containerClassName}`}
      open={initiallyOpen || true}
    >
      <summary className="block cursor-pointer marker:hidden">{header}</summary>
      {children}
    </details>
  );
}

export default Accordion;
