import { useEffect, useState } from 'react';
import { UserPlus, Mail, Shield, Key, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { adminsService, type AdminProfile } from '@/services/adminsService';

export default function AdminsListPage() {
  const { success, error: toastError } = useToast();
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loadAdmins = async () => {
    setIsLoading(true);
    const { data, error } = await adminsService.getAdmins();
    if (error) {
      toastError('Error', error);
    } else if (data) {
      setAdmins(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toastError('Error', 'Todos los campos son requeridos');
      return;
    }
    
    setIsSubmitting(true);
    const { error } = await adminsService.createAdmin({ name, email, password });
    setIsSubmitting(false);

    if (error) {
      toastError('Error', error);
    } else {
      success('Éxito', 'Administrador creado correctamente');
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      loadAdmins();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Administradores</h1>
          <p className="text-muted-foreground">Gestiona los usuarios con acceso al panel de control.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Añadir Administrador
        </Button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando administradores...</div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No se encontraron administradores.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Nombre</th>
                  <th className="px-6 py-4 font-medium">Correo electrónico</th>
                  <th className="px-6 py-4 font-medium">Rol</th>
                  <th className="px-6 py-4 font-medium">Fecha de registro</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {admins.map(admin => (
                  <tr key={admin.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 font-medium">{admin.name}</td>
                    <td className="px-6 py-4">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(admin.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
              <h2 className="text-lg font-semibold">Añadir Nuevo Administrador</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    placeholder="Ej. Juan Pérez" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@cee.edu.pe" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña temporal</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="text" 
                    placeholder="Ej. CeeAdmin2026" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="pl-9"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  El usuario podrá iniciar sesión con esta contraseña y su correo.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creando...' : 'Crear Administrador'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
