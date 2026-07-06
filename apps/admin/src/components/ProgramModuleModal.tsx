import { useState, useEffect } from 'react';
import type { Course } from '@cee/types';
import { coursesService } from '@/services/coursesService';
import { programsService } from '@/services/programsService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';

export function ProgramModuleModal({ programId, onClose, onAdded }: { programId: string, onClose: () => void, onAdded: () => void }) {
  const { success, error } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: cData }, { data: mData }] = await Promise.all([
        coursesService.getCourses(),
        programsService.getProgramCourses(programId)
      ]);
      if (cData) setCourses(cData);
      if (mData) setModules(mData);
    }
    load();
  }, [programId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourseIds.length === 0) return;
    setIsSubmitting(true);
    
    // Sort order starts after the last existing module
    let nextSortOrder = modules.length > 0 ? modules[modules.length - 1].sort_order + 1 : 1;
    
    const coursesData = selectedCourseIds.map(id => {
      const data = { course_id: id, sort_order: nextSortOrder };
      nextSortOrder++;
      return data;
    });

    const { error: err } = await programsService.addCoursesToProgram(programId, coursesData);
    if (err) {
      error('Error al añadir módulos', err);
    } else {
      success('Módulos añadidos', 'Los cursos se añadieron al programa y las horas se recalcularon.');
      onAdded();
      onClose();
    }
    setIsSubmitting(false);
  };

  const availableCourses = courses.filter(c => !modules.some(m => m.course_id === c.id));

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold">Añadir Cursos (Módulos)</h2>
            <p className="text-sm text-gray-500">Selecciona uno o más cursos para añadir al programa</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-3">
            {availableCourses.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No hay cursos disponibles para añadir.</p>
            ) : (
              availableCourses.map(c => (
                <label key={c.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mt-1 shrink-0"
                    checked={selectedCourseIds.includes(c.id)}
                    onChange={() => toggleCourse(c.id)}
                  />
                  <div>
                    <p className="font-medium text-sm text-gray-900">{c.title}</p>
                    <p className="text-xs text-gray-500">{c.academicHours || 0} horas académicas</p>
                  </div>
                </label>
              ))
            )}
          </div>
          
          <div className="px-6 py-4 border-t flex justify-end gap-3 shrink-0 bg-gray-50">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={selectedCourseIds.length === 0 || isSubmitting}>
              Añadir {selectedCourseIds.length > 0 ? `(${selectedCourseIds.length})` : ''}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
