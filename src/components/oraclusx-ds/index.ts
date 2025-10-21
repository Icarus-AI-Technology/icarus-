/**
 * OraclusX Design System - Index (Atualizado)
 * Exportação centralizada de TODOS os componentes
 * 
 * COMPONENTES: 42 total
 * - Core: 8
 * - Form: 6
 * - Navigation: 3
 * - Feedback: 6
 * - Data Display: 4
 * - Chatbot: 4 (incluindo ChatbotWithResearch)
 * - Enterprise (Novos): 11
 */

// ===== CORE COMPONENTS (8) =====
export { Button } from"./Button";
export type { ButtonProps } from"./Button";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from"./Card";
export type { CardProps } from"./Card";

export { Input } from"./Input";
export type { InputProps } from"./Input";

export { InputContainer } from"./InputContainer";
export type { InputContainerProps } from"./InputContainer";

export { SearchField } from"./SearchField";
export type { SearchFieldProps } from"./SearchField";

export { SearchContainer } from"./SearchContainer";
export type { SearchContainerProps } from"./SearchContainer";

export { Textarea } from"./Textarea";
export type { TextareaProps } from"./Textarea";

export { IconButtonNeu } from"./IconButtonNeu";
export type { IconButtonNeuProps } from"./IconButtonNeu";

// ===== FORM COMPONENTS (6) =====
export { FormField, TextInput, TextArea, Select, Checkbox, Radio, FormGroup } from"./Form";
export type {
  FormFieldProps,
  TextInputProps,
  TextAreaProps,
  SelectProps,
  CheckboxProps,
  RadioProps,
  FormGroupProps,
} from"./Form";

export { FormBanner } from"./FormBanner";
export type { FormBannerProps } from"./FormBanner";

export { Switch } from"./Switch";
export type { SwitchProps } from"./Switch";

// ===== NAVIGATION COMPONENTS (3) =====
export { NavigationBar } from"./NavigationBar";
export type { NavigationBarProps, NavigationTab } from"./NavigationBar";

export { SubModulesNavigation } from"./SubModulesNavigation";
export type { SubModulesNavigationProps } from"./SubModulesNavigation";

export { TopbarIconButton } from"./TopbarIconButton";
export type { TopbarIconButtonProps } from"./TopbarIconButton";

// ===== FEEDBACK COMPONENTS (6) =====
export { Dialog } from"./Dialog";
export type { DialogProps } from"./Dialog";

export { Modal } from"./Modal";
export type { ModalProps } from"./Modal";

export { Drawer } from"./Drawer";
export type { DrawerProps } from"./Drawer";

export { Toast } from"./Toast";
export type { ToastProps } from"./Toast";

export { Tooltip } from"./Tooltip";
export type { TooltipProps } from"./Tooltip";

export { Progress } from"./Progress";
export type { ProgressProps } from"./Progress";

// ===== DATA DISPLAY COMPONENTS (4) =====
export { Avatar } from"./Avatar";
export type { AvatarProps } from"./Avatar";

export { Badge } from"./Badge";
export type { BadgeProps } from"./Badge";

export { Dropdown } from"./Dropdown";
export type { DropdownProps, DropdownItem } from"./Dropdown";

export { LibraryShowcase } from"./LibraryShowcase";

// ===== CHATBOT COMPONENTS (4) =====
export { ChatbotFAB } from"./ChatbotFAB";
export type { ChatbotFABProps } from"./ChatbotFAB";

export { ChatbotFABWithPrompt } from"./ChatbotFABWithPrompt";
export type { ChatbotFABWithPromptProps } from"./ChatbotFABWithPrompt";

export { ChatbotCloseButton } from"./ChatbotCloseButton";
export type { ChatbotCloseButtonProps } from"./ChatbotCloseButton";

export { ChatbotWithResearch } from"./ChatbotWithResearch";
export type { ChatbotWithResearchProps, Message as ChatbotMessage } from"./ChatbotWithResearch";

// ===== ENTERPRISE COMPONENTS (11) - NOVOS! =====
export { Table } from"./Table";
export type { TableProps, TableColumn } from"./Table";

export { Tabs } from"./Tabs";
export type { TabsProps, Tab } from"./Tabs";

export { Accordion } from"./Accordion";
export type { AccordionProps, AccordionItem } from"./Accordion";

export { Breadcrumb } from"./Breadcrumb";
export type { BreadcrumbProps, BreadcrumbItem } from"./Breadcrumb";

export { Pagination } from"./Pagination";
export type { PaginationProps } from"./Pagination";

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonList } from"./Skeleton";
export type { SkeletonProps } from"./Skeleton";

export { Alert } from"./Alert";
export type { AlertProps } from"./Alert";

export { Stepper } from"./Stepper";
export type { StepperProps, Step } from"./Stepper";

export { DatePicker } from"./DatePicker";
export type { DatePickerProps } from"./DatePicker";

export { FileUpload } from"./FileUpload";
export type { FileUploadProps } from"./FileUpload";

// ===== NEUROMORPHIC COMPONENTS (4) - DASHBOARD! =====
export { NeomorphicCard } from './NeomorphicCard';
export type { NeomorphicCardProps } from './NeomorphicCard';

export { NeomorphicIconBox } from './NeomorphicIconBox';
export type { NeomorphicIconBoxProps, IconColorVariant, IconSize } from './NeomorphicIconBox';

export { MiniBarChart } from './MiniBarChart';
export type { MiniBarChartProps, BarColorScheme } from './MiniBarChart';

export { TrendIndicator, getTrendIcon, getTrendColor, formatTrend } from './TrendIndicator';
export type { TrendIndicatorProps } from './TrendIndicator';
