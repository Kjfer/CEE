import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { BenefitCategory } from '@cee/types';
import { Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BENEFIT_CATEGORY_OPTIONS } from '@/constants/benefitCategory';
import { useBenefits } from '@/hooks/useBenefits';
import { useToast } from '@/hooks/useToast';
import { cn, formatDateLong } from '@/lib/utils';

const CATEGORY_STYLES: Record<BenefitCategory, string> = {
  descuento: 'bg-blue-50 text-blue-700',
  acceso: 'bg-purple-50 text-purple-700',
  servicio: 'bg-emerald-50 text-emerald-700',
};

const CATEGORY_FILTER_OPTIONS: { value: BenefitCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  ...BENEFIT_CATEGORY_OPTIONS,
];

export default function BenefitsListPage() {
  const { benefits, isLoading, toggleActive, remove } = useBenefits();
  const { success } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<BenefitCategory | 'all'>('all');

  const filteredBenefits = useMemo(() => {
    const q = search.trim().toLowerCase();
    return benefits.filter((b) => {
      const matchSearch = b.title.toLowerCase().includes(q);
      const matchCategory = categoryFilter === 'all' || b.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [benefits, search, categoryFilter]);

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await toggleActive(id, isActive);
    success('Beneficio actualizado', isActive ? 'El beneficio quedó activo.' : 'El beneficio quedó inactivo.');
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    success('Beneficio eliminado', 'El beneficio se eliminó correctamente.');
  };

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beneficios y descuentos</h1>
          <p className="mt-0.5 text-sm text-[#A9A9A9]">
            Administra los beneficios visibles en el perfil de los estudiantes
          </p>
        </div>
        <Link
          to="/beneficios/nuevo"
          className="flex items-center gap-2 rounded-lg bg-[#682222] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4F1A1A] focus:outline-none focus:ring-2 focus:ring-[#682222]/40"
        >
          <Plus className="h-4 w-4" />
          Nuevo beneficio
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs border-gray-200 focus:border-[#682222] focus:ring-[#682222]/20"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as BenefitCategory | 'all')}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40"
        >
          {CATEGORY_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {filteredBenefits.length > 0 && (
          <span className="ml-auto text-xs text-[#A9A9A9]">
            {filteredBenefits.length} beneficio{filteredBenefits.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-white shadow-sm">
          <p className="text-sm text-[#A9A9A9]">Cargando beneficios...</p>
        </div>
      ) : filteredBenefits.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-white shadow-sm">
          <p className="text-sm text-[#A9A9A9]">No se encontraron beneficios con esos filtros.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#682222] text-left">
                  {['Beneficio', 'Categoría', 'Valor', 'Código', 'Vigencia', 'Activo', 'Acciones'].map((h) => (
                    <th
                      key={h}
                      className={cn(
                        'px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white',
                        h === 'Acciones' && 'text-right',
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBenefits.map((benefit, idx) => (
                  <tr
                    key={benefit.id}
                    className={cn(
                      'border-b border-gray-100 last:border-0 transition-colors hover:bg-[#f5eded]',
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#f9f9f9]',
                    )}
                  >
                    <td className="max-w-[240px] truncate px-5 py-3.5 font-medium text-gray-900">
                      {benefit.title}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn('inline-flex rounded-md px-2 py-0.5 text-xs font-medium', CATEGORY_STYLES[benefit.category])}>
                        {BENEFIT_CATEGORY_OPTIONS.find((o) => o.value === benefit.category)?.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#682222]">{benefit.discountLabel}</td>
                    <td className="px-5 py-3.5 text-gray-600">{benefit.code ?? '—'}</td>
                    <td className="px-5 py-3.5 text-[#A9A9A9]">
                      {benefit.validUntil ? formatDateLong(benefit.validUntil) : 'Sin vencimiento'}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(benefit.id, !benefit.isActive)}
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                          benefit.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500',
                        )}
                      >
                        {benefit.isActive ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button asChild variant="outline" size="sm" className="h-8 border-gray-200 text-xs hover:border-[#682222] hover:text-[#682222]">
                          <Link to={`/beneficios/${benefit.id}/editar`}>Editar</Link>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-600">
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar beneficio?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se eliminará "{benefit.title}" permanentemente. Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(benefit.id)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
