import type { Course } from '@cee/types';
import { LandingInstructors } from './LandingInstructors';
import { LandingOutcomes } from './LandingOutcomes';
import { LandingSyllabus } from './LandingSyllabus';

interface CourseModuleDetailProps {
  course: Course;
}

/** Detalle reutilizable de un curso/módulo dentro de un programa. */
export function CourseModuleDetail({ course }: CourseModuleDetailProps) {
  return (
    <div className="space-y-8 pt-2">
      <p className="text-sm leading-relaxed text-muted-foreground">{course.description}</p>
      {course.benefits.length > 0 && <LandingOutcomes items={course.benefits} />}
      <LandingSyllabus modules={course.syllabus} />
      <LandingInstructors instructors={course.instructors} />
    </div>
  );
}
