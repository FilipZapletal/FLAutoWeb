export function SectionTitle({ children, as: Tag = "h2", className = "", id }: { children: React.ReactNode; as?: "h1" | "h2"; className?: string; id?: string }) {
  return (
    <Tag id={id} className={`flex items-center gap-2 ${Tag === "h1" ? "text-2xl md:text-3xl" : "text-xl"} ${className}`}>
      <span className="accent-bar" />
      {children}
    </Tag>
  );
}
