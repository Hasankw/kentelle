import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "sale" | "new" | "soldout" | "default";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variants = {
    sale: "bg-red-500 text-white",
    new: "bg-brand-blue text-white rounded",
    soldout: "bg-brand-contrast text-white rounded",
    default: "bg-brand-navy text-white rounded",
  };

  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-widest",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
