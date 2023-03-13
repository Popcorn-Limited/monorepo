function Fieldset({ children, label: labelContent, className }: { children: any; label: string; className?: string }) {
  return (
    <fieldset className={`${className} flex items-center gap-2`}>
      <label className="min-w-[12rem]">{labelContent}</label>
      {children}
    </fieldset>
  );
}

export default Fieldset;
