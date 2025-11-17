/**
 * Sistema de Formulário Multi-Step Avançado
 * Com validação real-time, progresso visual e animações
 * 100% OraclusX DS + Neumorphism 3D Premium + Lucide React SVG
 */

import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// CONTEXT & TYPES
// ============================================

interface FormStep {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  validate?: () => Promise<boolean> | boolean;
}

interface MultiStepFormContextType {
  currentStep: number;
  totalSteps: number;
  steps: FormStep[];
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isStepValid: boolean;
  setIsStepValid: (valid: boolean) => void;
}

const MultiStepFormContext = createContext<
  MultiStepFormContextType | undefined
>(undefined);

export function useMultiStepForm() {
  const context = useContext(MultiStepFormContext);
  if (!context) {
    throw new Error(
      "useMultiStepForm must be used within MultiStepFormProvider",
    );
  }
  return context;
}

// ============================================
// MULTI-STEP FORM PROVIDER
// ============================================

interface MultiStepFormProps {
  steps: FormStep[];
  children: ReactNode;
  onComplete?: () => void;
  className?: string;
}

export function MultiStepForm({
  steps,
  children,
  onComplete,
  className,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isStepValid, setIsStepValid] = useState(true);

  const nextStep = async () => {
    // Validar antes de avançar
    const currentStepData = steps[currentStep];
    if (currentStepData.validate) {
      const valid = await currentStepData.validate();
      if (!valid) {
        setIsStepValid(false);
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsStepValid(true);
    } else if (onComplete) {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsStepValid(true);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
      setIsStepValid(true);
    }
  };

  const value: MultiStepFormContextType = {
    currentStep,
    totalSteps: steps.length,
    steps,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    isStepValid,
    setIsStepValid,
  };

  return (
    <MultiStepFormContext.Provider value={value}>
      <div className={cn("w-full", className)}>{children}</div>
    </MultiStepFormContext.Provider>
  );
}

// ============================================
// STEP INDICATOR (Progress)
// ============================================

export function StepIndicator() {
  const { currentStep, totalSteps, steps, goToStep } = useMultiStepForm();

  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="relative h-2 neuro-inset rounded-full mb-6 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-[var(--primary)] rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>

      {/* Steps */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isAccessible = index <= currentStep;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center flex-1"
              onClick={() => isAccessible && goToStep(index)}
              style={{ cursor: isAccessible ? "pointer" : "not-allowed" }}
            >
              {/* Circle */}
              <motion.div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isCompleted && "neuro-inset bg-[var(--primary)]",
                  isCurrent && "neuro-raised",
                  !isCompleted && !isCurrent && "neuro-flat opacity-50",
                )}
                whileHover={isAccessible ? { scale: 1.1 } : {}}
                whileTap={isAccessible ? { scale: 0.95 } : {}}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span
                    className={cn(
                      "text-[var(--text-primary)]",
                      !isCurrent && "opacity-50",
                    )}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.813rem",
                      fontWeight: 600,
                    }}
                  >
                    {index + 1}
                  </span>
                )}
              </motion.div>

              {/* Label */}
              <span
                className={cn(
                  "mt-2 text-center",
                  isCurrent
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)]",
                )}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.813rem",
                  fontWeight: isCurrent ? 600 : 400,
                }}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// STEP CONTENT (with Animation)
// ============================================

export function StepContent() {
  const { currentStep, steps } = useMultiStepForm();
  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-[400px] mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step Header */}
          <div className="mb-6">
            <h2
              className="text-[var(--text-primary)] mb-2"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.813rem",
                fontWeight: 700,
              }}
            >
              {currentStepData.title}
            </h2>
            {currentStepData.description && (
              <p
                className="text-[var(--text-secondary)]"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.813rem",
                }}
              >
                {currentStepData.description}
              </p>
            )}
          </div>

          {/* Step Component */}
          <div className="neuro-raised rounded-2xl p-6">
            {currentStepData.component}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================
// NAVIGATION BUTTONS
// ============================================

export function StepNavigation() {
  const { isFirstStep, isLastStep, nextStep, prevStep, isStepValid } =
    useMultiStepForm();

  return (
    <div className="flex justify-between items-center">
      {/* Botão Voltar */}
      <motion.button
        type="button"
        onClick={prevStep}
        disabled={isFirstStep}
        className={cn(
          "flex items-center gap-2 px-6 py-3 rounded-xl transition-all",
          isFirstStep
            ? "neuro-inset opacity-50 cursor-not-allowed"
            : "neuro-raised hover:neuro-flat",
        )}
        whileHover={!isFirstStep ? { scale: 1.02 } : {}}
        whileTap={!isFirstStep ? { scale: 0.98 } : {}}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.813rem",
          fontWeight: 500,
          color: "var(--text-primary)",
        }}
      >
        <ChevronLeft className="w-5 h-5" />
        Voltar
      </motion.button>

      {/* Botão Avançar/Concluir */}
      <motion.button
        type="button"
        onClick={nextStep}
        disabled={!isStepValid}
        className={cn(
          "flex items-center gap-2 px-6 py-3 rounded-xl transition-all",
          !isStepValid
            ? "neuro-inset opacity-50 cursor-not-allowed"
            : "neuro-raised hover:neuro-flat bg-[var(--orx-primary)]",
        )}
        whileHover={isStepValid ? { scale: 1.02 } : {}}
        whileTap={isStepValid ? { scale: 0.98 } : {}}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.813rem",
          fontWeight: 500,
          color: "#ffffff",
        }}
      >
        {isLastStep ? "Concluir" : "Próximo"}
        <ChevronRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}

// ============================================
// COMPLETE MULTI-STEP FORM (All-in-One)
// ============================================

interface CompleteMultiStepFormProps {
  steps: FormStep[];
  onComplete?: () => void;
  className?: string;
}

export function CompleteMultiStepForm({
  steps,
  onComplete,
  className,
}: CompleteMultiStepFormProps) {
  return (
    <MultiStepForm steps={steps} onComplete={onComplete} className={className}>
      <div className="neuro-raised rounded-2xl p-8 bg-[var(--bg-primary)]">
        <StepIndicator />
        <StepContent />
        <StepNavigation />
      </div>
    </MultiStepForm>
  );
}
