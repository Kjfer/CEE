import { Link } from 'react-router-dom';
import { Gift, Sparkles, Tag } from 'lucide-react';
import type { Benefit, BenefitCategory } from '@cee/types';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useBenefits } from '@/hooks/useBenefits';
import { formatDateLong, getInitials } from '@/lib/utils';

const CATEGORY_ICON: Record<BenefitCategory, typeof Gift> = {
  descuento: Tag,
  acceso: Sparkles,
  servicio: Gift,
};

const CATEGORY_LABEL: Record<BenefitCategory, string> = {
  descuento: 'Descuento',
  acceso: 'Acceso',
  servicio: 'Servicio',
};

function BenefitCard({ benefit }: { benefit: Benefit }) {
  const Icon = CATEGORY_ICON[benefit.category];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-cee-red/20 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cee-red/10 text-cee-red">
          <Icon className="h-5 w-5" />
        </span>
        <span className="rounded-full bg-cee-red px-3 py-1 text-xs font-bold text-white">
          {benefit.discountLabel}
        </span>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {CATEGORY_LABEL[benefit.category]}
        </p>
        <p className="mt-1 font-semibold">{benefit.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
      </div>
      {(benefit.code || benefit.validUntil) && (
        <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          {benefit.code && (
            <span>
              Código: <span className="font-semibold text-cee-red">{benefit.code}</span>
            </span>
          )}
          {benefit.validUntil && <span>Válido hasta {formatDateLong(benefit.validUntil)}</span>}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { benefits, isLoading: isBenefitsLoading } = useBenefits();

  if (isAuthLoading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Cargando perfil...</p>
      </section>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Inicia sesión para ver tu perfil</h1>
        <p className="mt-3 text-muted-foreground">
          Tus beneficios, descuentos y datos de estudiante aparecen aquí una vez que inicias sesión.
        </p>
        <Button asChild className="mt-6">
          <Link to={ROUTES.LOGIN}>Iniciar sesión</Link>
        </Button>
      </section>
    );
  }

  return (
    <>
      <section className="bg-cee-red text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-5 px-4 py-12 sm:flex-row sm:items-center sm:px-6 sm:py-16 lg:px-8">
          <Avatar
            src={user.avatarUrl}
            alt={user.name}
            fallback={getInitials(user.name)}
            className="h-20 w-20 text-xl"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl">{user.name}</h1>
            <p className="mt-1 text-white/85">{user.email}</p>
            <span className="mt-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              {user.role === 'admin' ? 'Administrador' : 'Estudiante'}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-6 flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-widest text-cee-red">
            Beneficios CEE
          </p>
          <h2 className="text-2xl sm:text-3xl">Tus descuentos y beneficios</h2>
          <p className="mt-1 text-muted-foreground">
            Disponibles para ti como estudiante del Centro de Especialización Ejecutiva.
          </p>
        </div>

        {isBenefitsLoading ? (
          <p className="text-muted-foreground">Cargando beneficios...</p>
        ) : benefits.length === 0 ? (
          <p className="text-muted-foreground">No tienes beneficios activos por el momento.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <BenefitCard key={benefit.id} benefit={benefit} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
