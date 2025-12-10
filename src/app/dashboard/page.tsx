'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { logout, formatDate } from '@/lib/auth';
import { getSession, resetDatabase } from '@/lib/storage';
import { Session } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      router.push('/');
      return;
    }
    setSession(currentSession);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleResetDatabase = () => {
    resetDatabase();
    alert('Base de datos reiniciada');
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">UniPortal</CardTitle>
              <CardDescription>Sistema de Gestion Academica</CardDescription>
            </div>
            <div className="text-right">
              <p className="font-semibold">{session.name}</p>
              <p className="text-sm text-muted-foreground">{session.role}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8 border-b">
              <h2 className="text-2xl font-semibold mb-2">Bienvenido al Sistema!</h2>
              <p className="text-muted-foreground">Has iniciado sesion correctamente.</p>
              <p className="text-muted-foreground">
                Esta es una pagina de demostracion para pruebas de autenticacion.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Informacion de Sesion:</h4>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <strong>Estado:</strong> Sesion Activa
                </p>
                <p>
                  <strong>Email:</strong> {session.email}
                </p>
                <p>
                  <strong>Rol:</strong> {session.role}
                </p>
                <p>
                  <strong>Inicio de sesion:</strong> {formatDate(session.loginTime)}
                </p>
                <p>
                  <strong>Expira:</strong> {formatDate(session.expiresAt)}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="destructive" onClick={handleLogout}>
                Cerrar Sesion
              </Button>
            </div>

            <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
              <AlertDescription>
                <h4 className="font-semibold mb-2">Opciones de Prueba:</h4>
                <p className="text-sm mb-3">
                  Estas opciones son solo para pruebas del sistema:
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResetDatabase}
                >
                  Reiniciar Base de Datos
                </Button>
                <p className="text-xs mt-2 text-muted-foreground">
                  Esto restaurara todos los usuarios y contrasenas a sus valores
                  originales.
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
