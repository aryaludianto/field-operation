import type { HTMLAttributes } from 'react';
import clsx from 'classnames';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur',
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={clsx('text-sm font-semibold text-slate-500', className)} {...props} />;
}

export function CardValue({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={clsx('text-3xl font-semibold text-slate-900', className)} {...props} />;
}
