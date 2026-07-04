import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Instructor } from '@cee/types';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/useToast';
import { instructorsService } from '@/services/instructorsService';

export default function InstructorsListPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { error, success } = useToast();

  useEffect(() => {
    let isMounted = true;
    instructorsService
      .getInstructors()
      .then((res) => {
        if (isMounted) setInstructors(res.data);
      })
      .catch((err) => {
        if (isMounted) {
          error('Error', err instanceof Error ? err.message : 'No se pudieron cargar los profesores');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [error]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este profesor?')) return;
    try {
      await instructorsService.deleteInstructor(id);
      setInstructors((prev) => prev.filter((i) => i.id !== id));
      success('Profesor eliminado', 'El profesor ha sido eliminado exitosamente.');
    } catch (err) {
      error('No se pudo eliminar', err instanceof Error ? err.message : 'Intenta nuevamente.');
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profesores</h1>
        <Button asChild>
          <Link to="/profesores/nuevo">
            <Plus className="mr-2 h-4 w-4" /> Registrar Profesor
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Foto</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">Bio</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Cargando profesores...
                </TableCell>
              </TableRow>
            ) : instructors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No hay profesores registrados.
                </TableCell>
              </TableRow>
            ) : (
              instructors.map((instructor) => (
                <TableRow key={instructor.id}>
                  <TableCell>
                    <img
                      src={instructor.photoUrl}
                      alt={instructor.name}
                      className="h-10 w-10 rounded-full object-cover border"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{instructor.name}</TableCell>
                  <TableCell>{instructor.title}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground max-w-xs truncate">
                    {instructor.bio}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link to={`/profesores/${instructor.id}/editar`} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(instructor.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
