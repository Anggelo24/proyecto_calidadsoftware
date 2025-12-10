'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

import { validateRecoveryToken, resetPassword } from '@/lib/auth';
import { getPasswordRequirements } from '@/lib/validation';
import { CONFIG } from '@/lib/types';

type Step = 'loading' | 'form' | 'error' | 'success';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [step, setStep] = useState<Step>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const requirements = getPasswordRequirements(newPassword);

  useEffect(() => {
    if (!token) {
      setErrorMessage(
        'Token no proporcionado. Por favor solicita un nuevo enlace de recuperacion.'
      );
      setStep('error');
      return;
    }

    const validation = validateRecoveryToken(token);
    if (!validation.valid) {
      setErrorMessage(validation.message);
      setStep('error');
      return;
    }

    setStep('form');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewPasswordError('');
    setConfirmPasswordError('');
    setAlertMessage('');
    setIsLoading(true);

    if (!token) {
      setAlertMessage('Token no valido');
      setIsLoading(false);
      return;
    }

    const result = resetPassword(token, newPassword, confirmPassword);

    if (result.success) {
      setStep('success');
    } else {
      if (result.message.includes('coinciden')) {
        setConfirmPasswordError(result.message);
      } else if (result.message.includes('contrasena')) {
        setNewPasswordError(result.message);
      } else {
        setAlertMessage(result.message);
      }
    }
    setIsLoading(false);
  };

  if (step === 'loading') {
    return (
      <div className="text-center py-8">
        <p>Verificando enlace...</p>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <>
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        <div className="text-center space-y-2">
          <Link href="/recuperar">
            <Button>Solicitar Nuevo Enlace</Button>
          </Link>
          <div>
            <Link href="/" className="text-sm text-primary hover:underline">
              Volver al Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (step === 'success') {
    return (
      <>
        <Alert className="border-green-500 mb-4">
          <AlertDescription>
            <strong>Contrasena actualizada!</strong>
            <p>Tu contrasena ha sido restablecida exitosamente.</p>
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Link href="/">
            <Button>Ir al Login</Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        Ingresa tu nueva contrasena. Asegurate de que cumpla con todos los
        requisitos.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field data-invalid={!!newPasswordError}>
          <FieldLabel htmlFor="newPassword">Nueva Contrasena</FieldLabel>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Ingresa tu nueva contrasena"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              aria-invalid={!!newPasswordError}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <FieldError>{newPasswordError}</FieldError>

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
              placeholder="Confirma tu nueva contrasena"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
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
          {isLoading ? 'Guardando...' : 'Guardar Nueva Contrasena'}
        </Button>

        {alertMessage && (
          <Alert variant="destructive">
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}
      </form>

      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-primary hover:underline">
          Volver al Login
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">UniPortal</CardTitle>
          <CardDescription>Restablecer Contrasena</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="text-center py-8">Cargando...</div>}>
            <ResetPasswordContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
