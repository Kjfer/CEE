import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend: number;
}

export function SummaryCard({ icon: Icon, label, value, trend }: SummaryCardProps) {
  const isPositive = trend >= 0;

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          <p
            className={cn(
              'mt-1 text-sm font-medium',
              isPositive ? 'text-emerald-600' : 'text-destructive',
            )}
          >
            {isPositive ? '+' : ''}
            {trend}% vs. mes anterior
          </p>
        </div>
        <div className="rounded-full bg-cee-red/10 p-3 text-cee-red">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
