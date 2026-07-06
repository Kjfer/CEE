import type { ApiResponse, Sale } from '@cee/types';
import { mockSaleRecords } from '@/mocks/salesRecords';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 350): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export interface SaleFormInput {
  userId?: string;
  studentName: string;
  courseId: string;
  courseName: string;
  amount: number;
  status: 'pending' | 'completed';
  notes?: string | null;
}

let salesCache: Sale[] = [...mockSaleRecords];

interface SaleRow {
  id: string;
  course_id: string;
  course_name: string;
  user_id: string | null;
  student_name: string | null;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface StudentNameRow {
  id: string;
  first_name: string;
  last_name_paterno: string;
  last_name_materno: string;
}

function rowToSale(row: SaleRow): Sale {
  return {
    id: row.id,
    courseId: row.course_id,
    courseName: row.course_name,
    userId: row.user_id ?? '',
    studentName: row.student_name,
    amount: Number(row.amount),
    date: row.created_at,
    status: row.status,
    notes: row.notes,
    updatedAt: row.updated_at,
  };
}

function buildStudentName(student: StudentNameRow): string {
  return [student.first_name, student.last_name_paterno, student.last_name_materno]
    .filter(Boolean)
    .join(' ')
    .trim();
}

export const salesRecordsService = {
  async getSales(): Promise<ApiResponse<Sale[]>> {
    if (USE_MOCKS) {
      const sorted = [...salesCache].sort((a, b) => b.date.localeCompare(a.date));
      return delay({ data: sorted });
    }

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error('No se pudieron cargar las ventas.');

    const sales = (data ?? []) as SaleRow[];
    const missingNames = sales
      .filter((sale) => !sale.student_name && sale.user_id)
      .map((sale) => sale.user_id as string);

    const studentNameMap = new Map<string, string>();
    if (missingNames.length > 0) {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, first_name, last_name_paterno, last_name_materno')
        .in('id', missingNames);

      if (studentsError) throw new Error('No se pudieron cargar los nombres de los alumnos.');

      (studentsData ?? []).forEach((student) => {
        const row = student as StudentNameRow;
        studentNameMap.set(row.id, buildStudentName(row));
      });
    }

    return {
      data: sales.map((sale) => ({
        ...rowToSale(sale),
        studentName: sale.student_name || studentNameMap.get(sale.user_id ?? '') || sale.student_name,
      })),
    };
  },

  async updateStatus(id: string, status: Sale['status']): Promise<ApiResponse<Sale>> {
    if (USE_MOCKS) {
      const idx = salesCache.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error(`Venta no encontrada: ${id}`);
      const now = new Date().toISOString();
      salesCache[idx] = { ...salesCache[idx], status, updatedAt: now };
      return delay({ data: salesCache[idx] });
    }

    const { data, error } = await supabase
      .from('sales')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) throw new Error('No se pudo actualizar el estado.');
    return { data: rowToSale(data as SaleRow) };
  },

  async createSale(input: SaleFormInput): Promise<ApiResponse<Sale>> {
    if (USE_MOCKS) {
      const now = new Date().toISOString();
      const newSale: Sale = {
        id: `s-${Date.now()}`,
        courseId: input.courseId,
        courseName: input.courseName,
        userId: input.userId ?? '',
        studentName: input.studentName,
        amount: input.amount,
        date: now,
        status: input.status,
        notes: input.notes ?? null,
        updatedAt: now,
      };
      salesCache = [newSale, ...salesCache];
      return delay({ data: newSale });
    }

    const { data, error } = await supabase
      .from('sales')
      .insert({
        course_id: input.courseId,
        course_name: input.courseName,
        user_id: input.userId ?? null,
        student_name: input.studentName,
        amount: input.amount,
        status: input.status,
        notes: input.notes ?? null,
      })
      .select('*')
      .single();

    if (error || !data) throw new Error('No se pudo registrar la inscripción.');
    return { data: rowToSale(data as SaleRow) };
  },
};
