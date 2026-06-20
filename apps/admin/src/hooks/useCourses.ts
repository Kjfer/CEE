import { useEffect, useState } from 'react';
import type { Course, CourseStatus } from '@cee/types';
import { coursesService } from '@/services/coursesService';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    coursesService
      .getCourses()
      .then((response) => {
        if (isMounted) {
          setCourses(response.data);
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
  }, []);

  const changeStatus = async (id: string, status: CourseStatus) => {
    const response = await coursesService.updateCourseStatus(id, status);
    setCourses((prev) => prev.map((c) => (c.id === id ? response.data : c)));
  };

  const remove = async (id: string) => {
    await coursesService.deleteCourse(id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  return { courses, isLoading, changeStatus, remove };
}
