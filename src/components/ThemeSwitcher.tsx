/**
 * THEME SWITCHER COMPONENT
 * 
 * Componente avançado para trocar temas e variantes de marca
 */

import { useState, useEffect } from 'react';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Download,
  Check,
} from 'lucide-react';
import {
  applyTheme,
  getCurrentTheme,
  toggleDarkMode,
  downloadTokensJSON,
  applyBrandVariant,
  THEMES,
  BRAND_VARIANTS,
  type ThemeName,
} from '@/lib/designTokens';
import {
  Button,
  Card,
  Badge,
  Dropdown,
} from '@/components/oraclusx-ds';

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(getCurrentTheme());
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Aplicar tema inicial
    applyTheme(currentTheme);
  }, []);

  const handleThemeChange = (theme: ThemeName) => {
    applyTheme(theme);
    setCurrentTheme(theme);
  };

  const handleToggleDarkMode = () => {
    toggleDarkMode();
    setCurrentTheme(getCurrentTheme());
  };

  const handleBrandVariant = (variantKey: string) => {
    const variant = BRAND_VARIANTS[variantKey];
    if (variant) {
      applyBrandVariant(variant);
    }
  };

  const getThemeIcon = (theme: ThemeName) => {
    switch (theme) {
      case 'dark':
        return <Moon size={16} />;
      case 'default':
        return <Sun size={16} />;
      case 'highContrast':
        return <Monitor size={16} />;
      default:
        return <Palette size={16} />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        icon={<Palette size={20} />}
        onClick={() => setShowPanel(!showPanel)}
        className="orx-hover-scale"
      >
        Temas
      </Button>

      {showPanel && (
        <Card className="absolute right-0 mt-2 w-80 p-4 z-50 neuro-raised orx-animate-slide-down">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--orx-text-primary)]">
                Personalização
              </h3>
              <Button
                variant="ghost"
                icon={<Download size={16} />}
                onClick={downloadTokensJSON}
                size="sm"
              >
                Exportar
              </Button>
            </div>

            {/* Quick Toggle */}
            <div className="flex gap-2">
              <Button
                variant={currentTheme === 'default' ? 'primary' : 'ghost'}
                icon={<Sun size={18} />}
                onClick={() => handleThemeChange('default')}
                className="flex-1"
                size="sm"
              >
                Claro
              </Button>
              <Button
                variant={currentTheme === 'dark' ? 'primary' : 'ghost'}
                icon={<Moon size={18} />}
                onClick={() => handleThemeChange('dark')}
                className="flex-1"
                size="sm"
              >
                Escuro
              </Button>
            </div>

            {/* All Themes */}
            <div>
              <h4 className="text-sm font-medium text-[var(--orx-text-secondary)] mb-2">
                Todos os Temas
              </h4>
              <div className="space-y-2">
                {Object.entries(THEMES).map(([key, label]) => (
                  <button type="button"
                    key={key}
                    onClick={() => handleThemeChange(key as ThemeName)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg orx-transition-all orx-hover-lift ${
                      currentTheme === key
                        ? 'neuro-inset bg-[var(--orx-bg-muted)]'
                        : 'neuro-flat hover:neuro-raised'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getThemeIcon(key as ThemeName)}
                      <span className="text-sm font-medium text-[var(--orx-text-primary)]">
                        {label}
                      </span>
                    </div>
                    {currentTheme === key && (
                      <Check size={16} className="text-[var(--orx-success)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Variants */}
            <div>
              <h4 className="text-sm font-medium text-[var(--orx-text-secondary)] mb-2">
                Variantes de Marca
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(BRAND_VARIANTS).map(([key, variant]) => (
                  <button type="button"
                    key={key}
                    onClick={() => handleBrandVariant(key)}
                    className="p-3 rounded-lg neuro-flat orx-hover-lift orx-transition-all text-left"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          background: `hsl(${variant.primary})`,
                        }}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          background: `hsl(${variant.accent})`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-[var(--orx-text-primary)]">
                      {variant.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="pt-3 border-t border-[var(--orx-border-muted)]">
              <p className="text-xs text-[var(--orx-text-secondary)]">
                As preferências são salvas automaticamente no navegador.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

