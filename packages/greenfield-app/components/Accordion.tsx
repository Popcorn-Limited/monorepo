function Accordion({ children, header }) {
  return (
    <details
      className="group p-8 bg-warmGray/25 rounded-2xl border border-warmGray/80 [&_summary::-webkit-details-marker]:hidden"
      open
    >
      <summary className="block cursor-pointer marker:hidden">{header}</summary>
      {children}
    </details>
  );
}

export default Accordion;
