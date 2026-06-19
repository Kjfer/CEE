import { useEffect, useState } from 'react';
import type { Course } from '@cee/types';
import { coursesService } from '@/services/courses.service';

export function useCourseDetail(slug: string | undefined) {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setCourse(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    coursesService
      .getBySlug(slug)
      .then((response) => {
        if (isMounted) {
          setCourse(response.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Curso no encontrado');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return { course, isLoading, error };
}
