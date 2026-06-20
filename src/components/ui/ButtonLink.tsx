import Link from "next/link";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "filled" | "outline" | "light";
};

export function ButtonLink({
  href,
  children,
  variant = "outline",
}: ButtonLinkProps) {
  const variants = {
    filled:
      "border-[#5f6440] bg-[#5f6440] text-[#f4efe4] hover:bg-[#4e5334]",
    outline:
      "border-[#f4efe4]/55 bg-transparent text-[#f4efe4] hover:bg-[#f4efe4] hover:text-[#182011]",
    light:
      "border-[#4a4b32] bg-transparent text-[#303323] hover:bg-[#303323] hover:text-[#f4efe4]",
  };

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center border px-6 py-3 text-[11px] font-medium uppercase tracking-[0.18em] transition ${variants[variant]}`}
    >
      {children}
      <span className="ml-2">→</span>
    </Link>
  );
}