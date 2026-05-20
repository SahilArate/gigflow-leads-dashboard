import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-white text-black hover:bg-zinc-200 font-medium",
      secondary: "bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-700",
      ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900",
      danger: "bg-red-600 text-white hover:bg-red-700",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-md",
      md: "px-4 py-2 text-sm rounded-lg",
      lg: "px-6 py-3 text-base rounded-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-white/20",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";