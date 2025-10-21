/**
 * OraclusX Design System - Avatar Component
 * Avatar neuromórfico com fallback
 */

import React from"react";
import { User } from"lucide-react";
import { cn } from"@/lib/utils";

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?:"sm" |"md" |"lg" |"xl";
  shape?:"circle" |"square";
  status?:"online" |"offline" |"away" |"busy";
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt ="Avatar",
  fallback,
  size ="md",
  shape ="circle",
  status,
  className,
}) => {
  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    sm:"w-8 h-8 text-body-xs",
    md:"w-10 h-10 text-body-sm",
    lg:"w-12 h-12 text-body",
    xl:"w-16 h-16 text-body-lg",
  };

  const statusColors = {
    online:"bg-success/50",
    offline:"bg-gray-400",
    away:"bg-warning/50",
    busy:"bg-destructive/50",
  };

  const statusSizes = {
    sm:"w-2 h-2",
    md:"w-2.5 h-2.5",
    lg:"w-3 h-3",
    xl:"w-4 h-4",
  };

  const getFallbackText = () => {
    if (fallback) {
      return fallback
        .split("")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return null;
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn("orx-card flex items-center justify-center overflow-hidden",
          sizeClasses[size],
          shape ==="circle" ?"rounded-full" :"rounded-lg",
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : getFallbackText() ? (
          <span className="text-secondary dark:text-muted" style={{ fontWeight: 500 }}>
            {getFallbackText()}
          </span>
        ) : (
          <User className="text-muted" size={size ==="sm" ? 16 : size ==="md" ? 20 : size ==="lg" ? 24 : 32} />
        )}
      </div>
      {status && (
        <span
          className={cn("absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-800",
            statusColors[status],
            statusSizes[size],
          )}
        />
      )}
    </div>
  );
};

Avatar.displayName ="OraclusXAvatar";

export default Avatar;

