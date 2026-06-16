import type { User } from '@cee/types';

export const mockUsers: User[] = [
  {
    id: 'u001',
    name: 'Carlos Ramos Herrera',
    email: 'admin@cee.fiis.uni.pe',
    role: 'admin',
    avatarUrl: 'https://picsum.photos/seed/user-u001/200/200',
  },
  {
    id: 'u002',
    name: 'María García López',
    email: 'maria.garcia@gmail.com',
    role: 'student',
    avatarUrl: 'https://picsum.photos/seed/user-u002/200/200',
  },
  {
    id: 'u003',
    name: 'Pedro López Ríos',
    email: 'pedro.lopez@outlook.com',
    role: 'student',
    avatarUrl: 'https://picsum.photos/seed/user-u003/200/200',
  },
  {
    id: 'u004',
    name: 'Lucía Fernández Castro',
    email: 'lucia.fernandez@gmail.com',
    role: 'student',
    avatarUrl: 'https://picsum.photos/seed/user-u004/200/200',
  },
];
