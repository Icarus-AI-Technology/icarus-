/**
 * Máscaras Automáticas - ICARUS v5.0
 * Sistema completo de formatação e validação de inputs
 * 
 * Características:
 * - 8 máscaras pré-definidas (CPF, CNPJ, Telefone, CEP, Data, Moeda, %, Placa)
 * - Auto-formatação em tempo real
 * - Validação integrada
 * - Remoção automática de caracteres não permitidos
 * - TypeScript strict
 */

export type MaskType = 
  | 'CPF'
  | 'CNPJ'
  | 'Telefone'
  | 'CEP'
  | 'Data'
  | 'Moeda'
  | 'Porcentagem'
  | 'Placa';

export interface MaskConfig {
  pattern: string;
  placeholder: string;
  maxLength: number;
  validate?: (value: string) => boolean;
  format: (value: string) => string;
  unformat: (value: string) => string;
}

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Remove todos os caracteres não numéricos
 */
export const onlyNumbers = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Remove todos os caracteres não alfanuméricos
 */
export const onlyAlphaNumeric = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9]/g, '');
};

/**
 * Valida CPF usando algoritmo oficial
 */
export const validateCPF = (cpf: string): boolean => {
  const numbers = onlyNumbers(cpf);
  
  if (numbers.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numbers)) return false; // Todos iguais
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder: number;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(10, 11))) return false;
  
  return true;
};

/**
 * Valida CNPJ usando algoritmo oficial
 */
export const validateCNPJ = (cnpj: string): boolean => {
  const numbers = onlyNumbers(cnpj);
  
  if (numbers.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(numbers)) return false;
  
  let length = numbers.length - 2;
  let digits = numbers.substring(0, length);
  const checker = numbers.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(digits.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(checker.charAt(0))) return false;
  
  length = length + 1;
  digits = numbers.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(digits.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(checker.charAt(1))) return false;
  
  return true;
};

/**
 * Valida data no formato DD/MM/YYYY
 */
export const validateData = (data: string): boolean => {
  const numbers = onlyNumbers(data);
  if (numbers.length !== 8) return false;
  
  const day = parseInt(numbers.substring(0, 2));
  const month = parseInt(numbers.substring(2, 4));
  const year = parseInt(numbers.substring(4, 8));
  
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;
  
  // Validação de dias por mês
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Ano bissexto
  if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
    daysInMonth[1] = 29;
  }
  
  if (day > daysInMonth[month - 1]) return false;
  
  return true;
};

/**
 * Valida placa de veículo (Mercosul)
 */
export const validatePlaca = (placa: string): boolean => {
  const cleaned = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // Formato antigo: AAA0000 ou AAA-0000
  const formatoAntigo = /^[A-Z]{3}\d{4}$/;
  
  // Formato Mercosul: AAA0A00 ou AAA-0A00
  const formatoMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  
  return formatoAntigo.test(cleaned) || formatoMercosul.test(cleaned);
};

// ============================================
// FORMATADORES
// ============================================

/**
 * Formata CPF: 000.000.000-00
 */
export const formatCPF = (value: string): string => {
  const numbers = onlyNumbers(value);
  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

/**
 * Formata CNPJ: 00.000.000/0000-00
 */
export const formatCNPJ = (value: string): string => {
  const numbers = onlyNumbers(value);
  return numbers
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

/**
 * Formata Telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export const formatTelefone = (value: string): string => {
  const numbers = onlyNumbers(value);
  
  if (numbers.length <= 10) {
    // Fixo: (00) 0000-0000
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  } else {
    // Celular: (00) 00000-0000
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }
};

/**
 * Formata CEP: 00000-000
 */
export const formatCEP = (value: string): string => {
  const numbers = onlyNumbers(value);
  return numbers
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

/**
 * Formata Data: DD/MM/YYYY
 */
export const formatData = (value: string): string => {
  const numbers = onlyNumbers(value);
  return numbers
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\/\d{4})\d+?$/, '$1');
};

/**
 * Formata Moeda: R$ 0.000.000,00
 */
export const formatMoeda = (value: string): string => {
  const numbers = onlyNumbers(value);
  
  if (!numbers) return 'R$ 0,00';
  
  const cents = numbers.slice(-2).padStart(2, '0');
  const reais = numbers.slice(0, -2) || '0';
  
  // Adiciona separadores de milhar
  const formattedReais = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `R$ ${formattedReais},${cents}`;
};

/**
 * Formata Porcentagem: 00,00%
 */
export const formatPorcentagem = (value: string): string => {
  const numbers = onlyNumbers(value);
  
  if (!numbers) return '0,00%';
  
  const decimal = numbers.slice(-2).padStart(2, '0');
  const inteiro = numbers.slice(0, -2) || '0';
  
  return `${inteiro},${decimal}%`;
};

/**
 * Formata Placa: AAA-0A00 (Mercosul) ou AAA-0000 (Antiga)
 */
export const formatPlaca = (value: string): string => {
  const cleaned = onlyAlphaNumeric(value).toUpperCase();
  
  if (cleaned.length <= 3) {
    return cleaned;
  }
  
  const letters = cleaned.substring(0, 3);
  const rest = cleaned.substring(3, 7);
  
  return `${letters}-${rest}`;
};

// ============================================
// CONFIGURAÇÕES DE MÁSCARAS
// ============================================

export const Mascaras: Record<MaskType, MaskConfig> = {
  CPF: {
    pattern: '000.000.000-00',
    placeholder: '___.___.___-__',
    maxLength: 14,
    validate: validateCPF,
    format: formatCPF,
    unformat: onlyNumbers,
  },
  
  CNPJ: {
    pattern: '00.000.000/0000-00',
    placeholder: '__.___.___/____-__',
    maxLength: 18,
    validate: validateCNPJ,
    format: formatCNPJ,
    unformat: onlyNumbers,
  },
  
  Telefone: {
    pattern: '(00) 00000-0000',
    placeholder: '(__) _____-____',
    maxLength: 15,
    validate: (value) => {
      const numbers = onlyNumbers(value);
      return numbers.length === 10 || numbers.length === 11;
    },
    format: formatTelefone,
    unformat: onlyNumbers,
  },
  
  CEP: {
    pattern: '00000-000',
    placeholder: '_____-___',
    maxLength: 9,
    validate: (value) => onlyNumbers(value).length === 8,
    format: formatCEP,
    unformat: onlyNumbers,
  },
  
  Data: {
    pattern: 'DD/MM/YYYY',
    placeholder: '__/__/____',
    maxLength: 10,
    validate: validateData,
    format: formatData,
    unformat: onlyNumbers,
  },
  
  Moeda: {
    pattern: 'R$ 0.000.000,00',
    placeholder: 'R$ 0,00',
    maxLength: 20,
    validate: (value) => {
      const numbers = onlyNumbers(value);
      return numbers.length > 0;
    },
    format: formatMoeda,
    unformat: onlyNumbers,
  },
  
  Porcentagem: {
    pattern: '00,00%',
    placeholder: '0,00%',
    maxLength: 7,
    validate: (value) => {
      const numbers = onlyNumbers(value);
      const percent = parseFloat(numbers) / 100;
      return percent >= 0 && percent <= 100;
    },
    format: formatPorcentagem,
    unformat: onlyNumbers,
  },
  
  Placa: {
    pattern: 'AAA-0A00',
    placeholder: '___-____',
    maxLength: 8,
    validate: validatePlaca,
    format: formatPlaca,
    unformat: onlyAlphaNumeric,
  },
};

// ============================================
// HOOK REACT
// ============================================

export interface UseMaskReturn {
  value: string;
  displayValue: string;
  isValid: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  clear: () => void;
  setValue: (value: string) => void;
}

/**
 * Hook para aplicar máscaras em inputs
 */
export const useMask = (
  maskType: MaskType,
  initialValue = ''
): UseMaskReturn => {
  const [value, setValue] = React.useState(initialValue);
  const [isValid, setIsValid] = React.useState(false);
  
  const config = Mascaras[maskType];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const unformatted = config.unformat(newValue);
    const formatted = config.format(unformatted);
    
    setValue(formatted);
    
    if (config.validate) {
      setIsValid(config.validate(formatted));
    }
  };
  
  const handleBlur = () => {
    if (config.validate && value) {
      setIsValid(config.validate(value));
    }
  };
  
  const clear = () => {
    setValue('');
    setIsValid(false);
  };
  
  const setValueManual = (newValue: string) => {
    const formatted = config.format(newValue);
    setValue(formatted);
    
    if (config.validate) {
      setIsValid(config.validate(formatted));
    }
  };
  
  return {
    value: config.unformat(value),
    displayValue: value,
    isValid,
    onChange: handleChange,
    onBlur: handleBlur,
    clear,
    setValue: setValueManual,
  };
};

// React import para o hook

