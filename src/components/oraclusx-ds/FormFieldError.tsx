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

  return <p className="text-[var(--orx-error-dark)] text-[0.813rem] mt-1 leading-6">{error}</p>;
};
