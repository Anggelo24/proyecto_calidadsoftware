'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

import { requestPasswordRecovery } from '@/lib/auth';
import { validateEmail } from '@/lib/validation';

type Step = 'form' | 'token' | 'sent';

export default function RecuperarPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setIsLoading(true);

    const emailValidation = validateEmail(email.trim());
    if (!emailValidation.valid) {
      setEmailError(emailValidation.message);
      setIsLoading(false);
      return;
    }

    const result = requestPasswordRecovery(email.trim());

    if (result.token) {
      setGeneratedToken(result.token);
      setStep('token');
    } else {
      setStep('sent');
    }
    setIsLoading(false);
  };

  const copyToken = () => {
    const tokenLink = `${window.location.origin}/reset-password?token=${generatedToken}`;
    navigator.clipboard.writeText(tokenLink).then(() => {
      alert('Enlace copiado al portapapeles');
    });
  };

  const goToReset = () => {
    if (generatedToken) {
      router.push(`/reset-password?token=${generatedToken}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">UniPortal</CardTitle>
          <CardDescription>Recuperacion de Contrasena</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'form' && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Ingresa tu correo electronico y te enviaremos un enlace para
                restablecer tu contrasena.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field data-invalid={!!emailError}>
                  <FieldLabel htmlFor="email">Correo Electronico</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tucorreo@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    aria-invalid={!!emailError}
                  />
                  <FieldError>{emailError}</FieldError>
                </Field>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperacion'}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Link href="/" className="text-sm text-primary hover:underline">
                  Volver al Login
                </Link>
              </div>
            </>
          )}

          {step === 'token' && (
            <>
              <div className="bg-muted p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">
                  Enlace de Recuperacion Generado
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  En un sistema real, este enlace se enviaria por email. Para
                  pruebas, usa el siguiente enlace:
                </p>
                <code className="block bg-background p-2 rounded text-xs break-all mb-3">
                  {typeof window !== 'undefined' &&
                    `${window.location.origin}/reset-password?token=${generatedToken}`}
                </code>
                <div className="flex gap-2">
                  <Button onClick={copyToken} size="sm">
                    Copiar Enlace
                  </Button>
                  <Button onClick={goToReset} variant="secondary" size="sm">
                    Ir a Restablecer
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Nota:</strong> El token expira en 24 horas. Si
                  solicitas otro token, el anterior se invalidara.
                </AlertDescription>
              </Alert>

              <div className="mt-4 text-center">
                <Link href="/" className="text-sm text-primary hover:underline">
                  Volver al Login
                </Link>
              </div>
            </>
          )}

          {step === 'sent' && (
            <>
              <Alert className="border-green-500 mb-4">
                <AlertDescription>
                  Si el correo esta registrado en nuestro sistema, recibiras un
                  enlace de recuperacion.
                </AlertDescription>
              </Alert>

              <p className="text-center text-sm text-muted-foreground mb-4">
                Revisa tu bandeja de entrada y la carpeta de spam.
              </p>

              <div className="text-center">
                <Link href="/" className="text-sm text-primary hover:underline">
                  Volver al Login
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
