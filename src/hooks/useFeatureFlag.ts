/**
 * Custom Hook: useFeatureFlag
 * Gerencia feature flags do PostHog com cache local
 */

import { useState, useEffect } from 'react';
import { analyticsService } from '@/lib/analytics/posthog.service';

interface UseFeatureFlagOptions {
  defaultValue?: boolean;
  enableCache?: boolean;
  cacheDuration?: number; // em ms
}

interface FeatureFlagCache {
  value: boolean;
  timestamp: number;
}

const featureFlagCache = new Map<string, FeatureFlagCache>();

/**
 * Hook para verificar feature flags
 *
 * @example
 * const showNewDashboard = useFeatureFlag('new_dashboard_ui');
 * if (showNewDashboard) {
 *   return <NewDashboard />;
 * }
 * return <OldDashboard />;
 */
export function useFeatureFlag(flagKey: string, options: UseFeatureFlagOptions = {}): boolean {
  const {
    defaultValue = false,
    enableCache = true,
    cacheDuration = 5 * 60 * 1000, // 5 minutos
  } = options;

  const [isEnabled, setIsEnabled] = useState<boolean>(defaultValue);

  useEffect(() => {
    let mounted = true;

    async function checkFlag() {
      try {
        // Verificar cache primeiro
        if (enableCache) {
          const cached = featureFlagCache.get(flagKey);
          if (cached && Date.now() - cached.timestamp < cacheDuration) {
            if (mounted) {
              setIsEnabled(cached.value);
            }
            return;
          }
        }

        // Buscar do PostHog
        const enabled = await analyticsService.isFeatureEnabled(flagKey);

        if (mounted) {
          setIsEnabled(enabled);

          // Atualizar cache
          if (enableCache) {
            featureFlagCache.set(flagKey, {
              value: enabled,
              timestamp: Date.now(),
            });
          }
        }
      } catch (error) {
        const err = error as Error;
        console.error(`[useFeatureFlag] Error checking flag "${flagKey}":`, err);
        if (mounted) {
          setIsEnabled(defaultValue);
        }
      }
    }

    checkFlag();

    return () => {
      mounted = false;
    };
  }, [flagKey, defaultValue, enableCache, cacheDuration]);

  return isEnabled;
}

/**
 * Hook para verificar feature flag com loading state
 */
export function useFeatureFlagWithLoading(
  flagKey: string,
  options: UseFeatureFlagOptions = {}
): { isEnabled: boolean; isLoading: boolean } {
  const { defaultValue = false, enableCache = true, cacheDuration = 5 * 60 * 1000 } = options;

  const [isEnabled, setIsEnabled] = useState<boolean>(defaultValue);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function checkFlag() {
      try {
        if (enableCache) {
          const cached = featureFlagCache.get(flagKey);
          if (cached && Date.now() - cached.timestamp < cacheDuration) {
            if (mounted) {
              setIsEnabled(cached.value);
              setIsLoading(false);
            }
            return;
          }
        }

        const enabled = await analyticsService.isFeatureEnabled(flagKey);

        if (mounted) {
          setIsEnabled(enabled);
          setIsLoading(false);

          if (enableCache) {
            featureFlagCache.set(flagKey, {
              value: enabled,
              timestamp: Date.now(),
            });
          }
        }
      } catch (error) {
        const err = error as Error;
        console.error(`[useFeatureFlagWithLoading] Error:`, err);
        if (mounted) {
          setIsEnabled(defaultValue);
          setIsLoading(false);
        }
      }
    }

    checkFlag();

    return () => {
      mounted = false;
    };
  }, [flagKey, defaultValue, enableCache, cacheDuration]);

  return { isEnabled, isLoading };
}

/**
 * Hook para obter variant de feature flag (A/B testing)
 *
 * @example
 * const variant = useFeatureFlagVariant('dashboard_layout', 'classic');
 * // variant = 'classic' | 'modern' | 'compact'
 */
export function useFeatureFlagVariant(flagKey: string, defaultVariant: string = 'control'): string {
  const [variant, setVariant] = useState<string>(defaultVariant);

  useEffect(() => {
    let mounted = true;

    async function getVariant() {
      try {
        const flagVariant = await analyticsService.getFeatureFlagVariant(flagKey);

        if (mounted) {
          setVariant(flagVariant || defaultVariant);
        }
      } catch (error) {
        const err = error as Error;
        console.error(`[useFeatureFlagVariant] Error:`, err);
        if (mounted) {
          setVariant(defaultVariant);
        }
      }
    }

    getVariant();

    return () => {
      mounted = false;
    };
  }, [flagKey, defaultVariant]);

  return variant;
}

/**
 * Limpa cache de feature flags (útil após logout)
 */
export function clearFeatureFlagCache(): void {
  featureFlagCache.clear();
}
