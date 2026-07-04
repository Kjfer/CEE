import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    // Escuchar cambios de estado en la sesión (el enlace de reseteo autentica automáticamente al usuario)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          // El usuario ha sido autenticado por el enlace de recuperación y puede cambiar su contraseña
          console.log('Recovery session active');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      toastError('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      toastError('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      toastError('Error', error.message);
    } else {
      success('Contraseña actualizada', 'Tu contraseña ha sido cambiada exitosamente.');
      // Cerrar sesión y redirigir al login
      await supabase.auth.signOut();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-cee-red rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
            <Shield className="w-8 h-8 text-white transform rotate-6" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Nueva Contraseña
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Ingresa tu nueva contraseña para acceder al sistema
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  className="pl-10"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-cee-red hover:bg-cee-red-dark text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Actualizando...' : 'Guardar y acceder'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
