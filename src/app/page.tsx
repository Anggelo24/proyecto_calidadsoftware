'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';

import { login } from '@/lib/auth';
import { initializeDatabase, getSession } from '@/lib/storage';
import { validateEmail } from '@/lib/validation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'success' | 'warning'>('error');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeDatabase();
    const session = getSession();
    if (session) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setAlertMessage('');
    setIsLoading(true);

    const emailValidation = validateEmail(email.trim());
    if (!emailValidation.valid) {
      setEmailError(emailValidation.message);
      setIsLoading(false);
      return;
    }

    if (!password) {
      setPasswordError('El campo contrasena es requerido');
      setIsLoading(false);
      return;
    }

    const result = login(email.trim(), password);

    if (result.success) {
      setAlertType('success');
      setAlertMessage(result.message);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } else {
      if (result.message.includes('ADVERTENCIA')) {
        setAlertType('warning');
      } else {
        setAlertType('error');
      }
      setAlertMessage(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">UniPortal</CardTitle>
          <CardDescription>Sistema de Gestion Academica</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold text-center mb-4">Iniciar Sesion</h2>

            <Field data-invalid={!!emailError}>
              <FieldLabel htmlFor="email">Correo Electronico</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="tucorreo@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                aria-invalid={!!emailError}
              />
              <FieldError>{emailError}</FieldError>
            </Field>

            <Field data-invalid={!!passwordError}>
              <FieldLabel htmlFor="password">Contrasena</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contrasena"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  aria-invalid={!!passwordError}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FieldError>{passwordError}</FieldError>
            </Field>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Iniciando...' : 'Iniciar Sesion'}
            </Button>

            {alertMessage && (
              <Alert
                variant={alertType === 'error' ? 'destructive' : 'default'}
                className={
                  alertType === 'success'
                    ? 'border-green-500 text-green-700 dark:text-green-400'
                    : alertType === 'warning'
                    ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400'
                    : ''
                }
              >
                <AlertDescription>{alertMessage}</AlertDescription>
              </Alert>
            )}

            <div className="text-center space-y-2">
              <div>
                <Link
                  href="/recuperar"
                  className="text-sm text-primary hover:underline"
                >
                  Olvidaste tu contrasena?
                </Link>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">No tienes cuenta? </span>
                <Link
                  href="/registro"
                  className="text-sm text-primary hover:underline"
                >
                  Registrate aqui
                </Link>
              </div>
            </div>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg text-sm">
            <h4 className="font-semibold mb-2">Usuarios de Prueba:</h4>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong>Email:</strong> estudiante@gmail.com
                <br />
                <strong>Contrasena:</strong> Passw0rd!23
              </p>
              <hr className="border-border" />
              <p>
                <strong>Email:</strong> profesor@gmail.com
                <br />
                <strong>Contrasena:</strong> Pr0fesor!2024
              </p>
              <hr className="border-border" />
              <p>
                <strong>Email:</strong> admin@gmail.com
                <br />
                <strong>Contrasena:</strong> Adm1n!Secure
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
