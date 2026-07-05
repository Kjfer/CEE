import type { ApiResponse, Certificate, CertificateStatus } from '@cee/types';
import { mockCertificates } from '@/mocks/certificates.mock';
import { supabase } from '@/lib/supabase';
import { buildCertificateFiles } from '@/lib/certificate-builder';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 350): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export interface CertificateFormInput {
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  programId?: string | null;
  profileId?: string | null;
  academicHours: number;
  grade: number;
  issuedAt: string;
  completedAt?: string | null;
  notes?: string | null;
}

let certsCache: Certificate[] = [...mockCertificates];

function nextCertNumber(certs: Pick<Certificate, 'certificateNumber'>[]): string {
  const year = new Date().getFullYear();
  const max = certs.reduce((m, c) => {
    const parts = c.certificateNumber.split('-');
    const n = parseInt(parts[2] ?? '0', 10);
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `CEE-${year}-${String(max + 1).padStart(4, '0')}`;
}

function randomVerificationCode(): string {
  const part = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `CEE-${new Date().getFullYear()}-${part}`;
}

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
  status: CertificateStatus;
  signed_document_url: string | null;
  signature_provider: 'manual' | 'digital';
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

async function uploadCertificateFiles(
  verificationCode: string,
  pdfBytes: Uint8Array,
  previewBlob: Blob,
): Promise<{ pdfUrl: string; previewUrl: string }> {
  const pdfPath = `${verificationCode}.pdf`;
  const pngPath = `${verificationCode}.png`;

  const { error: pdfError } = await supabase.storage
    .from('certificates')
    .upload(pdfPath, pdfBytes, { contentType: 'application/pdf', upsert: true });
  if (pdfError) throw new Error(`Error al subir PDF: ${pdfError.message}`);

  const { error: pngError } = await supabase.storage
    .from('certificates')
    .upload(pngPath, previewBlob, { contentType: 'image/png', upsert: true });
  if (pngError) throw new Error(`Error al subir preview: ${pngError.message}`);

  const { data: pdfData } = supabase.storage.from('certificates').getPublicUrl(pdfPath);
  const { data: pngData } = supabase.storage.from('certificates').getPublicUrl(pngPath);
  return { pdfUrl: pdfData.publicUrl, previewUrl: pngData.publicUrl };
}

async function resolveProgramId(courseId: string): Promise<string | null> {
  const { data } = await supabase
    .from('program_courses')
    .select('program_id')
    .eq('course_id', courseId)
    .maybeSingle();
  return (data?.program_id as string | undefined) ?? null;
}

export const certificatesService = {
  async getCertificates(): Promise<ApiResponse<Certificate[]>> {
    if (USE_MOCKS) {
      const sorted = [...certsCache].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
      return delay({ data: sorted });
    }

    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('issued_at', { ascending: false });

    if (error) throw new Error('No se pudieron cargar los certificados.');
    return { data: (data ?? []).map((r) => rowToCert(r as CertRow)) };
  },

  /** Emite certificado digital: genera PDF, sube a Storage y marca como issued. */
  async issueCertificate(input: CertificateFormInput): Promise<ApiResponse<Certificate>> {
    if (USE_MOCKS) {
      const now = new Date().toISOString();
      const certNumber = nextCertNumber(certsCache);
      const verificationCode = randomVerificationCode();
      const newCert: Certificate = {
        id: `cert-${Date.now()}`,
        certificateNumber: certNumber,
        studentId: input.studentId,
        profileId: input.profileId ?? null,
        studentName: input.studentName,
        courseId: input.courseId,
        courseName: input.courseName,
        programId: input.programId ?? null,
        certificateType: 'course',
        grade: input.grade,
        academicHours: input.academicHours,
        verificationCode,
        pdfUrl: null,
        previewImageUrl: null,
        completedAt: input.completedAt ?? null,
        issuedAt: input.issuedAt,
        status: 'issued',
        signedDocumentUrl: null,
        signatureProvider: 'digital',
        notes: input.notes ?? null,
        createdAt: now,
        updatedAt: now,
      };
      certsCache = [newCert, ...certsCache];
      return delay({ data: newCert });
    }

    const programId = input.programId ?? (await resolveProgramId(input.courseId));
    const verificationCode = randomVerificationCode();

    const { data: existing } = await supabase
      .from('certificates')
      .select('certificate_number')
      .order('certificate_number', { ascending: false })
      .limit(50);

    const certNumber = nextCertNumber(
      (existing ?? []).map((r) => ({
        certificateNumber: (r as { certificate_number: string }).certificate_number,
      })),
    );

    const { pdfBytes, previewBlob } = await buildCertificateFiles({
      studentName: input.studentName,
      courseName: input.courseName,
      academicHours: input.academicHours,
      grade: input.grade,
      issuedAt: input.issuedAt,
      certificateNumber: certNumber,
    });

    const { pdfUrl, previewUrl } = await uploadCertificateFiles(verificationCode, pdfBytes, previewBlob);

    const { data, error } = await supabase
      .from('certificates')
      .insert({
        certificate_number: certNumber,
        student_id: input.studentId,
        profile_id: input.profileId ?? null,
        student_name: input.studentName,
        course_id: input.courseId,
        course_name: input.courseName,
        program_id: programId,
        certificate_type: 'course',
        grade: input.grade,
        academic_hours: input.academicHours,
        verification_code: verificationCode,
        pdf_url: pdfUrl,
        preview_image_url: previewUrl,
        signed_document_url: pdfUrl,
        completed_at: input.completedAt ?? null,
        issued_at: input.issuedAt,
        status: 'issued',
        signature_provider: 'digital',
        notes: input.notes ?? null,
      })
      .select('*')
      .single();

    if (error || !data) throw new Error(error?.message ?? 'No se pudo emitir el certificado.');
    return { data: rowToCert(data as CertRow) };
  },

  async createCertificate(input: Omit<CertificateFormInput, 'grade' | 'academicHours' | 'studentId'> & { studentId?: string }): Promise<ApiResponse<Certificate>> {
    return this.issueCertificate({
      ...input,
      studentId: input.studentId ?? '',
      grade: 0,
      academicHours: 0,
    });
  },

  async updateStatus(id: string, status: CertificateStatus): Promise<ApiResponse<Certificate>> {
    if (USE_MOCKS) {
      const idx = certsCache.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error(`Certificado no encontrado: ${id}`);
      const now = new Date().toISOString();
      certsCache[idx] = { ...certsCache[idx], status, updatedAt: now };
      return delay({ data: certsCache[idx] });
    }

    const { data, error } = await supabase
      .from('certificates')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) throw new Error('No se pudo actualizar el estado.');
    return { data: rowToCert(data as CertRow) };
  },

  async revoke(id: string): Promise<ApiResponse<Certificate>> {
    return certificatesService.updateStatus(id, 'revoked');
  },

  async regenerateFiles(id: string): Promise<ApiResponse<Certificate>> {
    const { data: cert } = await this.getCertificates().then((r) => ({
      data: r.data.find((c) => c.id === id),
    }));
    if (!cert?.verificationCode) throw new Error('Certificado no encontrado.');

    const { pdfBytes, previewBlob } = await buildCertificateFiles({
      studentName: cert.studentName,
      courseName: cert.courseName,
      academicHours: cert.academicHours ?? 0,
      grade: cert.grade ?? 0,
      issuedAt: cert.issuedAt,
      certificateNumber: cert.certificateNumber,
    });

    const { pdfUrl, previewUrl } = await uploadCertificateFiles(
      cert.verificationCode,
      pdfBytes,
      previewBlob,
    );

    const { data, error } = await supabase
      .from('certificates')
      .update({ pdf_url: pdfUrl, preview_image_url: previewUrl, signed_document_url: pdfUrl })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) throw new Error('No se pudo regenerar el certificado.');
    return { data: rowToCert(data as CertRow) };
  },
};
