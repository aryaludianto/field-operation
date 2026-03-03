import type { ButtonHTMLAttributes, ForwardedRef } from 'react';
import { forwardRef } from 'react';
import clsx from 'classnames';

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50';

const variants = {
  primary:
    'bg-leaf-500 text-white hover:bg-leaf-600 focus-visible:outline-leaf-500 shadow-sm shadow-leaf-500/20',
  outline:
    'border border-slate-200 text-slate-800 hover:bg-slate-50 focus-visible:outline-slate-400',
  subtle: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:outline-slate-300',
} as const;

const sizes = {
  md: 'h-10 px-4 py-2',
  lg: 'h-11 px-5 py-2.5 text-base',
  sm: 'h-9 px-3',
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export const Button = forwardRef(function Button(
  { className, variant = 'primary', size = 'md', ...props }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <button
      ref={ref}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});
