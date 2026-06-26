import type { ApiResponse, ContactLead } from '@cee/types';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLead(data: Omit<ContactLead, 'id' | 'createdAt'>): void {
  if (data.name.trim().length < 3) {
    throw new Error('El nombre debe tener al menos 3 caracteres.');
  }
  if (!EMAIL_REGEX.test(data.email.trim())) {
    throw new Error('El formato del email no es válido.');
  }
  if (!data.subject.trim()) {
    throw new Error('El asunto es obligatorio.');
  }
  if (data.message.trim().length < 10) {
    throw new Error('El mensaje debe tener al menos 10 caracteres.');
  }
}

/**
 * Datos crudos que captura el formulario de la landing del programa. A diferencia
 * de ContactLead, no incluye `subject`/`message` (se autogeneran a partir del curso).
 */
export interface LandingLeadInput {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  position?: string | null;
  source?: string; // p. ej. 'sidebar' | 'modal' | 'cta'
  courseId?: string | null;
  courseTitle?: string | null;
}

export const contactService = {
  async send(data: Omit<ContactLead, 'id' | 'createdAt'>): Promise<ApiResponse<ContactLead>> {
    validateLead(data);

    if (USE_MOCKS) {
      const lead: ContactLead = {
        ...data,
        id: `mock-lead-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      return delay({ data: lead });
    }

    // Sin .select(): la policy de contact_leads solo permite SELECT a admins,
    // así que no se puede leer de vuelta la fila recién insertada como anónimo.
    const { error } = await supabase.from('contact_leads').insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      course_interest: data.courseInterest,
      message: data.message,
      company: data.company ?? null,
      position: data.position ?? null,
      source: data.source ?? null,
    });

    if (error) {
      throw new Error('No se pudo enviar el mensaje. Intenta nuevamente.');
    }
    return { data: { ...data, id: '', createdAt: new Date().toISOString() } };
  },

  /**
   * Captura un lead desde la landing del programa. Autogenera `subject` y `message`
   * (columnas NOT NULL en contact_leads) a partir del curso, y persiste los campos
   * extra (empresa, cargo, source) de forma aditiva.
   */
  async sendLandingLead(input: LandingLeadInput): Promise<ApiResponse<ContactLead>> {
    const subject = input.courseTitle
      ? `Inscripción: ${input.courseTitle}`
      : 'Solicitud de información de programa';

    const messageParts = [
      `Lead capturado desde la landing del programa${input.courseTitle ? ` "${input.courseTitle}"` : ''}.`,
    ];
    if (input.company) messageParts.push(`Empresa: ${input.company}.`);
    if (input.position) messageParts.push(`Cargo: ${input.position}.`);
    if (input.source) messageParts.push(`Origen: ${input.source}.`);
    const message = messageParts.join(' ');

    return this.send({
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      subject,
      message,
      courseInterest: input.courseId ?? null,
      company: input.company ?? null,
      position: input.position ?? null,
      source: input.source ?? null,
    });
  },
};
