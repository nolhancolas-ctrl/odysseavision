type SectionLabelProps = {
  children: React.ReactNode;
  dark?: boolean;
};

export function SectionLabel({ children, dark = false }: SectionLabelProps) {
  return (
    <p
      className={`mb-5 text-[11px] font-semibold uppercase tracking-[0.24em] ${
        dark ? "text-[#f4efe4]/65" : "text-[#596044]"
      }`}
    >
      {children}
    </p>
  );
}