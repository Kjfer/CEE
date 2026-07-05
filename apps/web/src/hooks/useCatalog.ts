import { useEffect, useState } from 'react';
import type { CatalogItem, Course, CourseCategory, Program } from '@cee/types';
import { coursesService } from '@/services/courses.service';
import { programsService } from '@/services/programs.service';

export type CatalogKindFilter = 'all' | 'course' | 'program';

interface UseCatalogOptions {
  kind?: CatalogKindFilter;
  category?: CourseCategory | 'Todas';
}

export function useCatalog(options?: UseCatalogOptions) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const kind = options?.kind ?? 'all';
  const category = options?.category;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const params: Record<string, string> = {};
    if (category && category !== 'Todas') params.category = category;

    const load = async () => {
      try {
        const needCourses = kind === 'all' || kind === 'course';
        const needPrograms = kind === 'all' || kind === 'program';

        const [coursesRes, programsRes] = await Promise.all([
          needCourses
            ? coursesService.getAll({ ...params, standaloneOnly: true, pageSize: 100 })
            : Promise.resolve({ data: [] as Course[] }),
          needPrograms
            ? programsService.getAll({ ...params, pageSize: 100 })
            : Promise.resolve({ data: [] as Program[] }),
        ]);

        const moduleCounts = await programsService.getModuleCountsByProgramId(
          programsRes.data.map((p) => p.id),
        );

        const catalogItems: CatalogItem[] = [
          ...programsRes.data.map(
            (program): CatalogItem => ({
              kind: 'program',
              program,
              moduleCount: moduleCounts.get(program.id) ?? 0,
            }),
          ),
          ...coursesRes.data.map((course): CatalogItem => ({ kind: 'course', course })),
        ];

        if (isMounted) setItems(catalogItems);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error al cargar el catálogo.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [kind, category]);

  return { items, isLoading, error };
}
