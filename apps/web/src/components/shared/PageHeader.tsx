import type { ReactNode } from 'react';
import { Breadcrumb, type BreadcrumbItem } from '@/components/shared/Breadcrumb';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** Etiqueta corta sobre el título, p. ej. "CEE-FIIS" */
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  align?: 'left' | 'center';
  /** Controla solo el padding vertical: `lg` = portada de sección; `md` = encabezado compacto seguido de filtros/listas. El tamaño de letra es el mismo en ambos casos. */
  size?: 'md' | 'lg';
  /** Permite preservar el degradado exacto de cada página sin perder la estructura compartida */
  gradientClassName?: string;
  className?: string;
  /** Contenido adicional bajo la descripción (badges, métricas, avatar…) */
  children?: ReactNode;
  /** Contenido entre el breadcrumb y el título (p. ej. badges de categoría/nivel) */
  beforeTitle?: ReactNode;
  as?: 'section' | 'header';
}

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumb,
  align = 'left',
  size = 'lg',
  gradientClassName = 'bg-gradient-to-br from-cee-red-900 via-cee-red-700 to-cee-ink',
  className,
  children,
  beforeTitle,
  as = 'section',
}: PageHeaderProps) {
  const Tag = as;
  const isCenter = align === 'center';

  return (
    <Tag
      className={cn(
        'relative overflow-hidden border-b-4 border-cee-gray text-white',
        gradientClassName,
        className,
      )}
    >
      {/* Textura y brillo decorativos — dan profundidad sin alterar la paleta */}
      <div aria-hidden className="bg-dot-pattern-dark absolute inset-0 opacity-80" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 15%, rgba(255,255,255,0.10), transparent 45%)',
        }}
      />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/15" />

      <div
        className={cn(
          'relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
          size === 'lg' ? 'py-12 sm:py-16' : 'py-8 sm:py-10',
          isCenter && 'text-center',
        )}
      >
        {breadcrumb && (
          <div className={cn('mb-4 flex', isCenter && 'justify-center')}>
            <Breadcrumb variant="dark" items={breadcrumb} />
          </div>
        )}

        <div className={cn(isCenter && 'mx-auto', !isCenter && 'max-w-3xl')}>
          {beforeTitle}
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              {eyebrow}
            </p>
          )}
          <h1 className={cn('text-3xl leading-tight sm:text-4xl', eyebrow && 'mt-1.5')}>{title}</h1>
          {description && (
            <p
              className={cn(
                'mt-3 text-base text-white/90 sm:text-lg',
                isCenter ? 'mx-auto max-w-2xl' : 'max-w-2xl',
              )}
            >
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </Tag>
  );
}
