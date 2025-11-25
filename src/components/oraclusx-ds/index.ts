/**
 * OraclusX Design System - Central Export
 * TODOS os componentes enterprise (87 componentes)
 */

// ===== CORE COMPONENTS =====
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
export { Button } from './Button';
export { Input } from './Input';
export { Badge } from './Badge';
export { Alert } from './Alert';
export { Avatar } from './Avatar';
export { CardKpi } from './CardKpi';
export { CardKpiNeumo } from './CardKpiNeumo';

// ===== FORM COMPONENTS =====
export {
  FormField,
  FormGroup,
  TextInput,
  TextArea,
  Checkbox as FormCheckbox,
  Radio as FormRadio,
  Select as FormSelect,
} from './Form';
export { Select } from './Select';
export { Checkbox } from './Checkbox';
export { Radio } from './Radio';
export { Textarea } from './Textarea';
export { FileUpload } from './FileUpload';
export { DatePicker } from './DatePicker';
export { Slider } from './Slider';
export { Switch } from './Switch';
export { InputContainer } from './InputContainer';
export { FormBanner } from './FormBanner';
export { FormFieldError } from './FormFieldError';

// ===== NAVIGATION =====
export { Tabs } from './Tabs';
export { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';
export { Pagination } from './Pagination';
export { Dropdown } from './Dropdown';
export { NavigationBar } from './NavigationBar';
export { SubModulesNavigation } from './SubModulesNavigation';
export { CategoryTabs } from './CategoryTabs';

// ===== FEEDBACK =====
export { Modal } from './Modal';
export { Toast } from './Toast';
export { Tooltip } from './Tooltip';
export { Progress } from './Progress';
export { RadialProgress } from './RadialProgress';
export { Skeleton } from './Skeleton';
export { SkeletonPage } from './SkeletonPage';
export { SkeletonRouteFallback } from './SkeletonRouteFallback';
export { Dialog } from './Dialog';
export {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogOverlay,
} from './DialogPrimitives';
export { Drawer } from './Drawer';
export { Accordion } from './Accordion';

// ===== DATA DISPLAY =====
export { Table } from './Table';
export {
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './TablePrimitives';
export { Stepper } from './Stepper';
export { TrendIndicator } from './TrendIndicator';
export { MiniCard } from './MiniCard';
export { MiniCardNeumo } from './MiniCardNeumo';
export { MiniBarChart } from './MiniBarChart';
export { StatsGrid } from './StatsGrid';

// ===== CHATBOT =====
export { ChatbotWithResearch } from './ChatbotWithResearch';
export { ChatbotFABWithPrompt } from './ChatbotFABWithPrompt';
export { ChatbotCloseButton } from './ChatbotCloseButton';

// ===== CHATBOT (NEW CONSOLIDATED) =====
export {
  ChatbotFAB,
  ChatbotWindow,
  SuggestionsPanel,
  type ChatbotFABProps,
  type ChatbotWindowProps,
  type SuggestionsPanelProps,
  type ChatSuggestion,
  type ModuleContext,
  type Message as ChatMessage,
} from './chatbot';

// ===== NEUMORPHIC COMPONENTS =====
export { NeumoButton } from './NeumoButton';
export { NeumoInput } from './NeumoInput';
export { NeumoTextarea } from './NeumoTextarea';
export { NeumoSearchBar } from './NeumoSearchBar';
export { NeomorphicCard } from './NeomorphicCard';
export { NeomorphicIconBox } from './NeomorphicIconBox';

// ===== LAYOUT & CONTAINERS =====
export { Container } from './Container';
export { Section } from './Section';
export { PageHeader } from './PageHeader';
export { ModulePageNeumo } from './ModulePageNeumo';
export { GlassCard } from './GlassCard';
export { AnimatedCard } from './AnimatedCard';

// ===== SEARCH & UTILITY =====
export { SearchContainer } from './SearchContainer';
export { SearchField } from './SearchField';
export { SearchBarNeumo } from './SearchBarNeumo';
export { IconButtonNeu } from './IconButtonNeu';
export { TopbarIconButton } from './TopbarIconButton';
export { TopbarIconButtonNeumo } from './TopbarIconButtonNeumo';
export { SidebarIconButtonNeumo } from './SidebarIconButtonNeumo';
export { LibraryShowcase } from './LibraryShowcase';

// ===== LAYOUT COMPONENTS (Cadastro) =====
// export { CadastroLayout } from "./CadastroLayout"; // Temporariamente comentado (importação circular)

// ===== RE-EXPORTS DE TIPOS =====
export type { CardProps } from './Card';
export type { ButtonProps } from './Button';
export type { InputProps } from './Input';
export type { BadgeProps } from './Badge';
export type { TableProps, TableColumn } from './Table';
export type { SelectProps, SelectOption } from './Select';

// ===== VARIANT EXPORTS (for advanced usage) =====
export { inputVariants } from './Input';
export { cardVariants } from './Card';
