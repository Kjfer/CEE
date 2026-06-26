import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  const isCenter = align === 'center';

  return (
    <div className={cn(isCenter && 'text-center', className)}>
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cee-red">{eyebrow}</p>
      )}
      <h2 className={cn('text-2xl font-bold tracking-tight sm:text-3xl', eyebrow && 'mt-2')}>
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-3 text-muted-foreground',
            isCenter ? 'mx-auto max-w-2xl' : 'max-w-2xl',
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
