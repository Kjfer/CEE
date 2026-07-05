import * as XLSX from 'xlsx';
import type { StudentFormInput } from '@/services/studentsService';

// Las columnas exactas que esperamos en el Excel
const TEMPLATE_HEADERS = [
  'DNI',
  'Nombres',
  'Apellido Paterno',
  'Apellido Materno',
  'Celular',
  'Correo',
  'Distrito',
  'Ciudad',
  'Profesion',
  'Fuente'
];

export const excelHelper = {
  /**
   * Genera y descarga una plantilla vacía de Excel para llenar alumnos.
   */
  downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      // Fila de ejemplo
      ['70000001', 'Juan', 'Perez', 'Gomez', '987654321', 'juan@correo.com', 'Miraflores', 'Lima', 'Ingeniero', 'web']
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Alumnos');
    XLSX.writeFile(wb, 'Plantilla_Registro_Alumnos.xlsx');
  },

  /**
   * Lee un archivo Excel y devuelve un arreglo de datos mapeados a StudentFormInput
   */
  async parseExcelFile(file: File): Promise<StudentFormInput[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (!workbook.SheetNames.length) {
            return reject(new Error('El archivo Excel está vacío.'));
          }

          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Leer las filas omitiendo la primera (cabecera)
          const rows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });

          const students: StudentFormInput[] = rows.map((row: any) => {
            // Manejar posibles variaciones en los nombres de columnas
            const dni = String(row['DNI'] || row['dni'] || '').trim();
            const firstName = String(row['Nombres'] || row['nombres'] || row['Nombre'] || '').trim();
            const lastNamePaterno = String(row['Apellido Paterno'] || row['apellido paterno'] || '').trim();
            const lastNameMaterno = String(row['Apellido Materno'] || row['apellido materno'] || '').trim();
            const phone = String(row['Celular'] || row['celular'] || row['Telefono'] || '').trim();
            const email = String(row['Correo'] || row['correo'] || row['Email'] || '').trim();
            const district = String(row['Distrito'] || row['distrito'] || '').trim();
            const city = String(row['Ciudad'] || row['ciudad'] || '').trim();
            const profession = String(row['Profesion'] || row['profesion'] || row['Profesión'] || '').trim();
            const sourceRaw = String(row['Fuente'] || row['fuente'] || '').trim().toLowerCase();

            // Mapeo simple de la fuente
            let source: any = 'manual';
            if (['web', 'whatsapp', 'manual', 'referido'].includes(sourceRaw)) {
              source = sourceRaw;
            }

            return {
              dni,
              firstName,
              lastNamePaterno,
              lastNameMaterno,
              phone,
              email: email || null,
              district: district || null,
              city: city || 'Lima',
              profession: profession || null,
              source,
              isWorking: false, // Por defecto al importar masivo, al menos que agreguemos una columna
            };
          });

          // Filtrar filas completamente vacías
          const validStudents = students.filter(s => s.dni && s.firstName && s.lastNamePaterno);
          resolve(validStudents);
        } catch (error) {
          reject(new Error('Error al procesar el archivo Excel. Asegúrate de usar la plantilla correcta.'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error de lectura del archivo.'));
      };

      reader.readAsArrayBuffer(file);
    });
  }
};
