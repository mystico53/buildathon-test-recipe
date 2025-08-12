import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-cooking hover:bg-primary/90 hover:shadow-cooking-lg",
        destructive:
          "bg-destructive text-destructive-foreground shadow-cooking hover:bg-destructive/90 hover:shadow-cooking-lg",
        outline:
          "border border-input bg-background shadow-sm hover:bg-muted/50 hover:text-accent-foreground hover:border-primary/30",
        secondary:
          "bg-secondary text-secondary-foreground shadow-cooking hover:bg-secondary/90 hover:shadow-cooking-lg",
        ghost: "hover:bg-muted/70 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        // New cooking-themed variants
        cooking:
          "bg-gradient-to-r from-cooking-saffron to-cooking-paprika text-white shadow-cooking hover:shadow-cooking-lg hover:from-cooking-saffron/90 hover:to-cooking-paprika/90",
        herb:
          "bg-cooking-herb text-white shadow-cooking hover:bg-cooking-herb/90 hover:shadow-cooking-lg",
        warm:
          "bg-cooking-lightCream border border-cooking-saffron/30 text-cooking-warmBrown shadow-cooking hover:bg-cooking-cream hover:border-cooking-saffron/50",
      },
      size: {
        default: "h-10 px-5 py-2.5 rounded-xl",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
