import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/auth.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!EMAIL_REGEX.test(email.trim())) {
      error('Error', 'Ingresa un correo con formato válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPasswordForEmail(email.trim());
      setEmailSent(true);
      success('Correo enviado', 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.');
    } catch (err) {
      error('Error', err instanceof Error ? err.message : 'No se pudo enviar el correo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-md gap-6 px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ingresa tu correo electrónico para recibir un enlace de recuperación.
        </p>
      </div>

      {!emailSent ? (
        <form className="mt-4 grid gap-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
          </Button>
        </form>
      ) : (
        <div className="rounded-xl border bg-green-50 p-6 text-center text-green-800">
          <p className="font-medium">¡Correo enviado!</p>
          <p className="mt-2 text-sm">
            Revisa tu bandeja de entrada o carpeta de spam para encontrar el enlace de recuperación.
          </p>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        ¿Recordaste tu contraseña?{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-cee-red hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </section>
  );
}
