import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-5 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-ink hover:brightness-110 min-h-14 text-lg shadow-sm",
  secondary: "bg-surface text-primary border-2 border-primary/30 hover:bg-primary-soft min-h-12",
  ghost: "text-primary hover:bg-primary-soft min-h-12",
  danger: "bg-surface text-danger border-2 border-danger/40 hover:bg-danger/10 min-h-12",
};

export function buttonClass(variant: Variant = "primary", block = true) {
  return `${base} ${variants[variant]} ${block ? "w-full" : ""}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
  children: ReactNode;
}

export function Button({ variant = "primary", block = true, className = "", type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={`${buttonClass(variant, block)} ${className}`} {...rest} />;
}

export const PrimaryButton = (p: Omit<ButtonProps, "variant">) => <Button variant="primary" {...p} />;
export const SecondaryButton = (p: Omit<ButtonProps, "variant">) => <Button variant="secondary" {...p} />;

export function ButtonLink({ variant = "primary", block = true, className = "", ...rest }: LinkProps & { variant?: Variant; block?: boolean }) {
  return <Link className={`${buttonClass(variant, block)} ${className}`} {...rest} />;
}

export function IconButton({ label, className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex size-12 items-center justify-center rounded-full text-primary hover:bg-primary-soft ${className}`}
      {...rest}
    />
  );
}
