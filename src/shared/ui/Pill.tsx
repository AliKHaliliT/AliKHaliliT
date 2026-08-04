import { ComponentProps } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib";

type Variant = "solid" | "ghost";

const pillClass = (variant: Variant) =>
  cn(
    "group inline-flex items-center gap-2.5 rounded-full border px-6 py-3",
    "font-mono text-xs font-medium uppercase tracking-[0.1em]",
    "transition-[transform,background-color,color,border-color] duration-200",
    "hover:-translate-y-px active:translate-y-0 active:scale-[0.97]",
    variant === "solid"
      ? "border-ink bg-ink text-surface hover:border-signal hover:bg-signal hover:text-white"
      : "border-ink bg-transparent text-ink hover:border-signal hover:text-signal"
  );

const Arrow = () => (
  <ArrowRight
    size={14}
    className="transition-transform duration-200 group-hover:translate-x-0.5"
    aria-hidden="true"
  />
);

/** The action atom: actions are round, data is square. */
export const PillLink = ({
  variant = "solid",
  className,
  children,
  withArrow = true,
  ...rest
}: ComponentProps<typeof Link> & { variant?: Variant; withArrow?: boolean }) => (
  <Link className={cn(pillClass(variant), className)} {...rest}>
    {children}
    {withArrow && <Arrow />}
  </Link>
);

/** A pill-shaped button, the round counterpart to a square data chip. */
export const PillButton = ({
  variant = "solid",
  className,
  children,
  withArrow = false,
  ...rest
}: ComponentProps<"button"> & { variant?: Variant; withArrow?: boolean }) => (
  <button className={cn(pillClass(variant), className)} {...rest}>
    {children}
    {withArrow && <Arrow />}
  </button>
);
