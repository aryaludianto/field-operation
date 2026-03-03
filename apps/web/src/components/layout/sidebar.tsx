import type { ReactNode } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export type SidebarProps = {
  title: string;
  subtitle: string;
  description: string;
  stats: { label: string; value: string | number; trend?: string }[];
  children?: ReactNode;
};

export function Sidebar({ title, subtitle, description, stats, children }: SidebarProps) {
  return (
    <aside className="border-r border-slate-200/70 bg-white/80">
      <div className="space-y-6 p-6">
        <Badge variant="green">{subtitle}</Badge>
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-3 text-sm text-slate-600">{description}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-100/80 bg-white/70 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
              {stat.trend ? <p className="text-xs text-slate-500">{stat.trend}</p> : null}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="lg">New mission</Button>
          <Button variant="outline" size="lg">
            Upload report
          </Button>
        </div>
        {children}
      </div>
    </aside>
  );
}
