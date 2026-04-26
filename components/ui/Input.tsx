import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-heading font-bold uppercase tracking-widest text-brand-navy"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full border border-brand-contrast/30 bg-transparent px-4 py-3 text-sm text-brand-navy placeholder:text-brand-contrast/60 outline-none focus:border-brand-navy transition-colors",
            error && "border-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-500">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
