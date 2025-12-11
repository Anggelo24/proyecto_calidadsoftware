'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Check, X } from 'lucide-react';

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

import { register } from '@/lib/auth';
import { initializeDatabase, getSession } from '@/lib/storage';
import { getPasswordRequirements } from '@/lib/validation';
import { CONFIG } from '@/lib/types';

export default function RegistroPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'success'>('error');
  const [isLoading, setIsLoading] = useState(false);

  const requirements = getPasswordRequirements(password);

  useEffect(() => {
    initializeDatabase();
    const session = getSession();
    if (session) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setAlertMessage('');
    setIsLoading(true);

    const result = register(name.trim(), email.trim(), password, confirmPassword);

    if (result.success) {
      setAlertType('success');
      setAlertMessage(result.message);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      setAlertType('error');
      if (result.message.includes('nombre')) {
        setNameError(result.message);
      } else if (result.message.includes('email') || result.message.includes('correo')) {
        setEmailError(result.message);
      } else if (result.message.includes('coinciden')) {
        setConfirmPasswordError(result.message);
      } else if (result.message.includes('contrasena')) {
        setPasswordError(result.message);
      } else {
        setAlertMessage(result.message);
      }
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
            <h2 className="text-xl font-semibold text-center mb-4">Crear Cuenta</h2>

            <Field data-invalid={!!nameError}>
              <FieldLabel htmlFor="name">Nombre Completo</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre completo"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                aria-invalid={!!nameError}
              />
              <FieldError>{nameError}</FieldError>
            </Field>

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
                  placeholder="Crea una contrasena segura"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
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

              <div className="mt-2 p-3 bg-muted rounded-lg text-sm">
                <h5 className="font-medium mb-2">Requisitos de contrasena:</h5>
                <ul className="space-y-1">
                  <li
                    className={`flex items-center gap-2 ${
                      requirements.length ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  >
                    {requirements.length ? <Check size={14} /> : <X size={14} />}
                    Minimo {CONFIG.MIN_PASSWORD_LENGTH} caracteres
                  </li>
                  <li
                    className={`flex items-center gap-2 ${
                      requirements.uppercase ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  >
                    {requirements.uppercase ? <Check size={14} /> : <X size={14} />}
                    Al menos una mayuscula
                  </li>
                  <li
                    className={`flex items-center gap-2 ${
                      requirements.lowercase ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  >
                    {requirements.lowercase ? <Check size={14} /> : <X size={14} />}
                    Al menos una minuscula
                  </li>
                  <li
                    className={`flex items-center gap-2 ${
                      requirements.special ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  >
                    {requirements.special ? <Check size={14} /> : <X size={14} />}
                    Al menos un caracter especial (!@#$%^&*...)
                  </li>
                </ul>
              </div>
            </Field>

            <Field data-invalid={!!confirmPasswordError}>
              <FieldLabel htmlFor="confirmPassword">Confirmar Contrasena</FieldLabel>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirma tu contrasena"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  aria-invalid={!!confirmPasswordError}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FieldError>{confirmPasswordError}</FieldError>
            </Field>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Crear Cuenta'}
            </Button>

            {alertMessage && (
              <Alert
                variant={alertType === 'error' ? 'destructive' : 'default'}
                className={
                  alertType === 'success'
                    ? 'border-green-500 text-green-700 dark:text-green-400'
                    : ''
                }
              >
                <AlertDescription>{alertMessage}</AlertDescription>
              </Alert>
            )}

            <div className="text-center">
              <span className="text-sm text-muted-foreground">Ya tienes una cuenta? </span>
              <Link
                href="/"
                className="text-sm text-primary hover:underline"
              >
                Inicia sesion
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
