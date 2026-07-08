import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LinkButtonProps = React.ComponentProps<typeof Link> &
  VariantProps<typeof buttonVariants> & {
    /** Full document navigation — use for auth routes to avoid RSC soft-nav failures. */
    hardNav?: boolean;
  };

export function LinkButton({
  className,
  variant,
  size,
  hardNav,
  href,
  ...props
}: LinkButtonProps) {
  const classes = cn(buttonVariants({ variant, size, className }));

  if (hardNav && typeof href === "string") {
    return <a href={href} className={cn(classes, "no-underline")} {...props} />;
  }

  return <Link href={href ?? "/"} className={classes} {...props} />;
}
