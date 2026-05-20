import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-zinc-300">{label}</label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full bg-zinc-900 border border-zinc-700 text-white",
            "rounded-lg px-3 py-2 text-sm transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-500",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" className="bg-zinc-900">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-zinc-900">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";