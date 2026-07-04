import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { success, error: toastError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsLoading(false);

    if (error) {
      toastError('Error', error.message);
    } else {
      setIsSent(true);
      success('Enlace enviado', 'Por favor, revisa tu correo electrónico (incluyendo la carpeta de spam).');
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
          Recuperar Contraseña
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Te enviaremos un enlace de seguridad
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-100">
          {!isSent ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    required
                    className="pl-10"
                    placeholder="admin@cee.edu.pe"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    to="/login"
                    className="font-medium text-cee-red hover:text-cee-red-dark flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver al login
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-cee-red hover:bg-cee-red-dark text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-900">Correo enviado</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Si existe una cuenta asociada a <strong>{email}</strong>, recibirás un enlace para restablecer tu contraseña.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsSent(false)}
              >
                Intentar con otro correo
              </Button>
              <div className="text-sm">
                <Link
                  to="/login"
                  className="font-medium text-cee-red hover:text-cee-red-dark"
                >
                  Volver al login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
