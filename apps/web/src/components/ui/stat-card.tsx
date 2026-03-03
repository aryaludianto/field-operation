import type { ReactNode } from 'react';
import { Card, CardTitle, CardValue } from './card';

export type StatCardProps = {
  label: string;
  value: string | number;
  trend?: ReactNode;
};

export function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <Card className="space-y-2">
      <CardTitle>{label}</CardTitle>
      <CardValue>{value}</CardValue>
      {trend ? <div className="text-sm text-slate-500">{trend}</div> : null}
    </Card>
  );
}
