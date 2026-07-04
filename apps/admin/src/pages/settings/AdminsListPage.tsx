import { useEffect, useState } from 'react';
import { UserPlus, Mail, Shield, Key, X, Lock, Unlock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { adminsService, type AdminProfile } from '@/services/adminsService';
import { useAuthStore } from '@/store/authStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminsListPage() {
  const { success, error: toastError } = useToast();
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [actionData, setActionData] = useState<{
    isOpen: boolean;
    type: 'toggle_status' | 'promote';
    targetId: string;
    targetName: string;
    isActive?: boolean;
  }>({
    isOpen: false,
    type: 'toggle_status',
    targetId: '',
    targetName: '',
  });

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
  const handleConfirmAction = async () => {
    const { targetId, type, isActive } = actionData;
    const { error } = await adminsService.toggleAdminStatus(
      targetId, 
      type, 
      type === 'toggle_status' ? !isActive : undefined
    );
    
    if (error) {
      toastError('Error', error);
    } else {
      success('Éxito', 'Acción realizada correctamente');
      loadAdmins();
    }
    setActionData({ ...actionData, isOpen: false });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Administradores</h1>
          <p className="text-muted-foreground">Gestiona los usuarios con acceso al panel de control.</p>
        </div>
        {user?.is_superadmin && (
          <Button onClick={() => setIsModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Añadir Administrador
          </Button>
        )}
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
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium">Fecha de registro</th>
                  {user?.is_superadmin && (
                    <th className="px-6 py-4 font-medium text-right">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {admins.map(admin => (
                  <tr key={admin.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 font-medium">{admin.name}</td>
                    <td className="px-6 py-4">{admin.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {admin.is_superadmin && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <Shield className="h-3 w-3" />
                            Super Admin
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${admin.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {admin.is_active ? 'Activo' : 'Inhabilitado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(admin.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    {user?.is_superadmin && (
                      <td className="px-6 py-4 text-right">
                        {!admin.is_superadmin && admin.id !== user.id && (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setActionData({
                                isOpen: true,
                                type: 'toggle_status',
                                targetId: admin.id,
                                targetName: admin.name,
                                isActive: admin.is_active
                              })}
                              className={admin.is_active ? "text-destructive hover:text-destructive/90" : "text-green-600 hover:text-green-700"}
                              title={admin.is_active ? 'Inhabilitar' : 'Habilitar'}
                            >
                              {admin.is_active ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActionData({
                                isOpen: true,
                                type: 'promote',
                                targetId: admin.id,
                                targetName: admin.name,
                              })}
                              className="text-amber-600 hover:text-amber-700"
                              title="Hacer Super Admin"
                            >
                              <ShieldAlert className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    )}
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
      )}      <AlertDialog 
        open={actionData.isOpen} 
        onOpenChange={(isOpen) => setActionData({ ...actionData, isOpen })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionData.type === 'promote' 
                ? '¿Hacer Super Administrador?' 
                : `¿${actionData.isActive ? 'Inhabilitar' : 'Habilitar'} a ${actionData.targetName}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionData.type === 'promote' 
                ? `Estás a punto de ascender a ${actionData.targetName} a Super Administrador. Esta acción le dará control total sobre la plataforma y no se puede deshacer fácilmente.`
                : `Si inhabilitas a este usuario, no podrá volver a iniciar sesión en el panel administrativo hasta que lo vuelvas a habilitar.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction}
              className={actionData.type === 'promote' ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
