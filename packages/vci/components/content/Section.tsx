function Section({ children, title, className }: { children: any; className?: string; title: string }) {
  return (
    <section className={`border-t p-4 mt-4 flex flex-col gap-4 ${className}`}>
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default Section;
