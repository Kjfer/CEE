import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/auth.service';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Escuchar cuando Supabase procesa el token del hash en la URL
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsReady(true);
      }
    });
    
    // Si la sesión ya existe, permitimos resetear
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsReady(true);
      }
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      error('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      error('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.updatePassword(password);
      success('Contraseña actualizada', 'Tu contraseña ha sido cambiada exitosamente.');
      navigate(ROUTES.HOME);
    } catch (err) {
      error('Error', err instanceof Error ? err.message : 'No se pudo actualizar la contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex justify-center p-16">
        <p className="text-muted-foreground">Verificando enlace de recuperación...</p>
      </div>
    );
  }

  return (
    <section className="mx-auto grid max-w-md gap-6 px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Cambiar contraseña</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ingresa tu nueva contraseña a continuación.
        </p>
      </div>

      <form className="mt-4 grid gap-5" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-1.5">
          <Label htmlFor="password">Nueva contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
        </Button>
      </form>
    </section>
  );
}
