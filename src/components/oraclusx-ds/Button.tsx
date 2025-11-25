import { forwardRef, isValidElement } from 'react';
import type { ReactNode } from 'react';
import { Button as HeroButton, ButtonProps as HeroButtonProps } from '@heroui/react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type IconSource = LucideIcon | ReactNode;

type BaseVariant = Exclude<HeroButtonProps['variant'], undefined>;

type ExtendedVariant =
  | BaseVariant
  | 'primary'
  | 'secondary'
  | 'default'
  | 'neumorphic'
  | 'neumo'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'error'
  | 'destructive'
  | 'outline';

type BaseSize = Exclude<HeroButtonProps['size'], undefined>;
type ExtendedSize = BaseSize | 'default';

export interface ButtonProps extends Omit<HeroButtonProps, 'variant' | 'size'> {
  variant?: ExtendedVariant;
  size?: ExtendedSize;
  neumorphic?: boolean;
  leftIcon?: IconSource;
  rightIcon?: IconSource;
  icon?: IconSource;
  /** Alias for isLoading */
  loading?: boolean;
}

const variantMap: Record<ExtendedVariant, BaseVariant> = {
  flat: 'flat',
  solid: 'solid',
  shadow: 'shadow',
  bordered: 'bordered',
  light: 'light',
  ghost: 'ghost',
  faded: 'faded',
  neumo: 'flat',
  neumorphic: 'flat',
  primary: 'solid',
  secondary: 'flat',
  default: 'flat',
  danger: 'solid',
  success: 'solid',
  warning: 'solid',
  info: 'solid',
  error: 'solid',
  destructive: 'solid',
  outline: 'bordered',
};

const colorMap: Partial<Record<ExtendedVariant, HeroButtonProps['color']>> = {
  primary: 'primary',
  secondary: 'secondary',
  default: 'default',
  danger: 'danger',
  success: 'success',
  warning: 'warning',
  info: 'primary',
  error: 'danger',
  destructive: 'danger',
};

const sizeMap: Record<ExtendedSize, HeroButtonProps['size']> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  default: 'md',
};

const renderIcon = (icon?: IconSource) => {
  if (!icon) return undefined;
  if (typeof icon === 'function') {
    const IconComponent = icon as LucideIcon;
    return <IconComponent size={18} className="text-current flex-shrink-0" />;
  }

  if (isValidElement(icon)) {
    return icon;
  }

  return icon;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'flat',
      size = 'md',
      className,
      neumorphic,
      leftIcon,
      rightIcon,
      icon,
      children,
      color,
      loading,
      isLoading,
      ...props
    },
    ref
  ) => {
    const mappedVariant = variantMap[variant] ?? 'flat';
    const mappedSize = sizeMap[size] ?? 'md';
    const resolvedColor = color ?? colorMap[variant];
    const isNeumorphic = neumorphic || variant === 'neumorphic' || variant === 'neumo';

    const startContent = renderIcon(leftIcon ?? (children ? icon : undefined));
    const endContent = renderIcon(rightIcon);
    const iconOnlyContent = !children ? renderIcon(icon) : null;

    return (
      <HeroButton
        ref={ref}
        variant={mappedVariant}
        size={mappedSize}
        color={resolvedColor}
        startContent={startContent}
        endContent={endContent}
        isIconOnly={!children && Boolean(iconOnlyContent)}
        isLoading={loading || isLoading}
        className={cn(
          isNeumorphic &&
            'bg-gradient-to-br from-white/10 to-white/5 border border-white/5 shadow-[5px_5px_15px_rgba(15,23,42,0.25),-5px_-5px_15px_rgba(255,255,255,0.15)] hover:shadow-[8px_8px_20px_rgba(15,23,42,0.35),-8px_-8px_20px_rgba(255,255,255,0.25)]',
          !children && iconOnlyContent && 'px-0 w-10 h-10',
          className
        )}
        {...props}
      >
        {children ?? iconOnlyContent}
      </HeroButton>
    );
  }
);

Button.displayName = 'OraclusButton';

export default Button;
