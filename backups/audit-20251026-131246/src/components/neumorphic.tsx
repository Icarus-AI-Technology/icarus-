import { cn } from "@/lib/utils";

interface NeumorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function NeumorphicCard({
  children,
  className,
  ...props
}: NeumorphicCardProps) {
  return (
    <div className={cn("neumorphic-card", className)} {...props}>
      {children}
    </div>
  );
}

interface NeumorphicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function NeumorphicButton({
  children,
  className,
  ...props
}: NeumorphicButtonProps) {
  return (
    <button className={cn("neumorphic-button", className)} {...props}>
      {children}
    </button>
  );
}

type NeumorphicInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function NeumorphicInput({ className, ...props }: NeumorphicInputProps) {
  return <input className={cn("neumorphic-input", className)} {...props} />;
}
