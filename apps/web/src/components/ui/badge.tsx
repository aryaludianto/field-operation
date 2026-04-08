import type { HTMLAttributes } from 'react';
import clsx from 'classnames';

const variants = {
  green: 'bg-leaf-100 text-leaf-700 ring-1 ring-inset ring-leaf-200',
  slate: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  amber: 'bg-amber-100 text-amber-900 ring-1 ring-amber-200',
} as const;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
};

export function Badge({ className, variant = 'green', ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
