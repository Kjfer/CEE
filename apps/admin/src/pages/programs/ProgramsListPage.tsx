import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Program, CourseCategory, CourseStatus } from '@cee/types';
import { MoreHorizontal, Plus } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { COURSE_STATUS_LABELS, COURSE_STATUS_OPTIONS } from '@/constants/courseStatus';
import { useToast } from '@/hooks/useToast';
import { cn, formatPrice } from '@/lib/utils';
import { programsService } from '@/services/programsService';
import { ProgramModuleModal } from '@/components/ProgramModuleModal';

const STATUS_STYLES: Record<CourseStatus, { cls: string; dot?: boolean }> = {
  published: { cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: true },
  draft:     { cls: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200' },
  review:    { cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
};

function StatusChip({ status }: { status: CourseStatus }) {
  const { cls, dot } = STATUS_STYLES[status];
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', cls)}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
      )}
      {COURSE_STATUS_LABELS[status]}
    </span>
  );
}

const CATEGORY_STYLES: Record<string, string> = {
  Ingeniería: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  Gestión: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  Tecnología: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  'Habilidades Blandas': 'bg-pink-50 text-pink-700 ring-1 ring-pink-200',
  Finanzas: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
};

function CategoryChip({ category }: { category: CourseCategory }) {
  const cls = CATEGORY_STYLES[category] || 'bg-gray-50 text-gray-700 ring-1 ring-gray-200';
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', cls)}>
      {category}
    </span>
  );
}

export default function ProgramsListPage() {
  const { success, error } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModalProgramId, setActiveModalProgramId] = useState<string | null>(null);

  const fetchPrograms = async () => {
    setIsLoading(true);
    const { data, error: err } = await programsService.getPrograms();
    if (err) {
      error('Error', err);
    } else if (data) {
      setPrograms(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleDelete = async (id: string) => {
    const { error: err } = await programsService.deleteProgram(id);
    if (err) {
      error('No se pudo eliminar el programa', err);
    } else {
      success('Programa eliminado', 'El programa se eliminó correctamente.');
      fetchPrograms();
    }
  };

  const handleChangeStatus = async (id: string, newStatus: CourseStatus) => {
    const { error: err } = await programsService.updateProgram(id, { status: newStatus } as any);
    if (err) {
      error('No se pudo cambiar el estado', err);
    } else {
      success('Estado actualizado', 'El estado del programa se actualizó correctamente.');
      fetchPrograms();
    }
  };

  const filteredPrograms = programs.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Programas</h1>
          <p className="mt-1 text-sm text-[#A9A9A9]">Gestiona los programas de estudio.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button asChild className="bg-[#682222] hover:bg-[#4F1A1A] w-full sm:w-auto">
            <Link to="/programas/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Programa
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Buscar programa..."
          className="h-10 sm:max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="ml-auto text-xs text-[#A9A9A9] flex items-center">
          {filteredPrograms.length} resultados
        </span>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-white shadow-sm">
          <p className="text-sm text-[#A9A9A9]">Cargando programas...</p>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl bg-white shadow-sm">
          <p className="text-sm font-medium text-gray-500">No se encontraron programas</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#682222] text-xs uppercase text-white">
                <tr>
                  <th className="px-5 py-3">Nombre</th>
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-5 py-3">Modalidad</th>
                  <th className="px-5 py-3">Precio</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {filteredPrograms.map((program) => (
                  <tr key={program.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900 truncate max-w-[300px]" title={program.title}>
                      {program.title}
                    </td>
                    <td className="px-5 py-4">
                      <CategoryChip category={program.category} />
                    </td>
                    <td className="px-5 py-4 text-gray-600">{program.modality}</td>
                    <td className="px-5 py-4 font-semibold text-[#682222]">
                      {formatPrice(program.price)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusChip status={program.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-gray-200 text-xs hover:border-[#682222] hover:text-[#682222]"
                          onClick={() => setActiveModalProgramId(program.id)}
                        >
                          <Plus className="mr-1 h-3 w-3" /> Cursos
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 border-gray-200 text-xs hover:border-[#682222] hover:text-[#682222]"
                        >
                          <Link to={`/programas/${program.id}/editar`}>Editar</Link>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#682222]/10">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {COURSE_STATUS_OPTIONS.map((opt) => (
                              <DropdownMenuItem
                                key={opt.value}
                                disabled={opt.value === program.status}
                                onClick={() => handleChangeStatus(program.id, opt.value)}
                              >
                                Marcar como {opt.label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem onClick={() => setActiveModalProgramId(program.id)}>
                              Gestionar Módulos
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-600">
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar programa?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se eliminará "{program.title}" permanentemente. Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(program.id)}>
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
      
      {activeModalProgramId && (
        <ProgramModuleModal 
          programId={activeModalProgramId} 
          onClose={() => setActiveModalProgramId(null)}
          onAdded={() => {
            // Optional: You could refresh programs or do something here
          }}
        />
      )}
    </section>
  );
}
