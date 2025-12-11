import emailjs from '@emailjs/browser';

// Configuracion de EmailJS
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_90e0c1o',
  TEMPLATE_ID: 'template_kh7jzf9',
  PUBLIC_KEY: '5yxwzTZWo5W0QHL7Y06hj',
} as const;

interface EmailParams {
  to_email: string;
  to_name: string;
  reset_link: string;
}

export async function sendRecoveryEmail(params: EmailParams): Promise<{ success: boolean; message: string }> {
  // Verificar si EmailJS esta configurado
  if (
    EMAILJS_CONFIG.SERVICE_ID === 'TU_SERVICE_ID' ||
    EMAILJS_CONFIG.TEMPLATE_ID === 'TU_TEMPLATE_ID' ||
    EMAILJS_CONFIG.PUBLIC_KEY === 'TU_PUBLIC_KEY'
  ) {
    return {
      success: false,
      message: 'EmailJS no esta configurado. Configura las credenciales en src/lib/emailjs.ts',
    };
  }

  try {
    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      {
        to_email: params.to_email,
        to_name: params.to_name,
        reset_link: params.reset_link,
      },
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    return {
      success: true,
      message: 'Email enviado exitosamente',
    };
  } catch (error) {
    console.error('Error enviando email:', error);
    return {
      success: false,
      message: 'Error al enviar el email. Intenta nuevamente.',
    };
  }
}
