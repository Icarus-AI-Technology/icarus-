/**
 * FormFieldError Component
 * OraclusX DS v5.0 - Mensagens de erro de formulário
 * Substituindo estilos inline com Hard Gates violations
 */

interface FormFieldErrorProps {
  error?: string;
}

export const FormFieldError = ({ error }: FormFieldErrorProps) => {
  if (!error) return null;

  return (
    <p
      style={{
        color: 'var(--orx-error-dark)',
        fontSize: '0.813rem',
        marginTop: '0.25rem',
        lineHeight: '1.5',
      }}
    >
      {error}
    </p>
  );
};

