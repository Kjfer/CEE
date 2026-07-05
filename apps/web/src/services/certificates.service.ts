import type { ApiResponse, Certificate, PublicCertificate } from '@cee/types';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 300): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const DEMO_CERTIFICATE: Certificate = {
  id: 'demo-cert-1',
  certificateNumber: 'CEE-2026-DEMO1',
  studentId: 'eee22222-2222-2222-2222-222222222222',
  profileId: 'eee11111-1111-1111-1111-111111111111',
  studentName: 'María Certificado Demo',
  courseId: 'c004',
  courseName: 'Liderazgo y Habilidades Directivas',
  programId: 'p001',
  certificateType: 'course',
  grade: 17.5,
  academicHours: 48,
  verificationCode: 'CEE-DEMO-2026-A1',
  pdfUrl: null,
  previewImageUrl: null,
  completedAt: '2026-06-15',
  issuedAt: '2026-06-20',
  status: 'issued',
  signedDocumentUrl: null,
  signatureProvider: 'digital',
  notes: null,
  createdAt: '2026-06-20T00:00:00.000Z',
  updatedAt: '2026-06-20T00:00:00.000Z',
};

interface CertRow {
  id: string;
  certificate_number: string;
  student_id: string | null;
  profile_id: string | null;
  student_name: string;
  course_id: string | null;
  course_name: string;
  program_id: string | null;
  certificate_type: 'course' | 'program';
  grade: number | null;
  academic_hours: number | null;
  verification_code: string | null;
  pdf_url: string | null;
  preview_image_url: string | null;
  completed_at: string | null;
  issued_at: string;
  status: Certificate['status'];
  signed_document_url: string | null;
  signature_provider: Certificate['signatureProvider'];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function rowToCert(row: CertRow): Certificate {
  return {
    id: row.id,
    certificateNumber: row.certificate_number,
    studentId: row.student_id,
    profileId: row.profile_id,
    studentName: row.student_name,
    courseId: row.course_id ?? '',
    courseName: row.course_name,
    programId: row.program_id,
    certificateType: row.certificate_type ?? 'course',
    grade: row.grade != null ? Number(row.grade) : null,
    academicHours: row.academic_hours,
    verificationCode: row.verification_code,
    pdfUrl: row.pdf_url ?? row.signed_document_url,
    previewImageUrl: row.preview_image_url,
    completedAt: row.completed_at,
    issuedAt: row.issued_at,
    status: row.status,
    signedDocumentUrl: row.signed_document_url,
    signatureProvider: row.signature_provider,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  };
}

export const certificatesService = {
  async getMyCertificates(profileId: string): Promise<ApiResponse<Certificate[]>> {
    if (USE_MOCKS) {
      return delay({ data: profileId ? [DEMO_CERTIFICATE] : [] });
    }

    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('profile_id', profileId)
      .in('status', ['issued', 'signed'])
      .order('issued_at', { ascending: false });

    if (error) throw new Error('No se pudieron cargar tus certificados.');
    return { data: (data ?? []).map((r) => rowToCert(r as CertRow)) };
  },

  async getPublicByCode(code: string): Promise<ApiResponse<PublicCertificate | null>> {
    if (USE_MOCKS) {
      if (code === DEMO_CERTIFICATE.verificationCode) {
        return delay({
          data: {
            certificateNumber: DEMO_CERTIFICATE.certificateNumber,
            studentName: DEMO_CERTIFICATE.studentName,
            courseName: DEMO_CERTIFICATE.courseName,
            programId: DEMO_CERTIFICATE.programId,
            grade: DEMO_CERTIFICATE.grade,
            academicHours: DEMO_CERTIFICATE.academicHours,
            issuedAt: DEMO_CERTIFICATE.issuedAt,
            status: DEMO_CERTIFICATE.status,
            verificationCode: DEMO_CERTIFICATE.verificationCode!,
            previewImageUrl: DEMO_CERTIFICATE.previewImageUrl,
            pdfUrl: DEMO_CERTIFICATE.pdfUrl,
          },
        });
      }
      return delay({ data: null });
    }

    const { data, error } = await supabase.rpc('get_public_certificate', { p_code: code });
    if (error) throw new Error('No se pudo verificar el certificado.');
    if (!data) return { data: null };

    const row = data as Record<string, unknown>;
    return {
      data: {
        certificateNumber: String(row.certificateNumber),
        studentName: String(row.studentName),
        courseName: String(row.courseName),
        programId: (row.programId as string | null) ?? null,
        grade: row.grade != null ? Number(row.grade) : null,
        academicHours: row.academicHours != null ? Number(row.academicHours) : null,
        issuedAt: String(row.issuedAt),
        status: row.status as PublicCertificate['status'],
        verificationCode: String(row.verificationCode),
        previewImageUrl: (row.previewImageUrl as string | null) ?? null,
        pdfUrl: (row.pdfUrl as string | null) ?? null,
      },
    };
  },
};
