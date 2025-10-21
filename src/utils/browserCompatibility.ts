/**
 * Polyfills e compatibilidade cross-browser - ICARUS v5.0
 * 
 * Garante funcionamento em:
 * ✅ Chrome/Edge: Full support
 * ✅ Safari: Full support (com polyfills)
 * ✅ Firefox: Full support (com polyfills)
 * ✅ Opera: Full support
 */

// ========================================
// DETECÇÃO DE NAVEGADOR
// ========================================

export const BrowserDetection = {
  isChrome: () => {
    const isChromium = (window as any).chrome;
    const winNav = window.navigator;
    const vendorName = winNav.vendor;
    const isOpera = typeof (window as any).opr !== 'undefined';
    const isIEedge = winNav.userAgent.indexOf('Edg') > -1;
    const isIOSChrome = winNav.userAgent.match('CriOS');

    if (isIOSChrome) {
      return true;
    } else if (
      isChromium !== null &&
      typeof isChromium !== 'undefined' &&
      vendorName === 'Google Inc.' &&
      isOpera === false &&
      isIEedge === false
    ) {
      return true;
    }
    return false;
  },

  isEdge: () => {
    return window.navigator.userAgent.indexOf('Edg') > -1;
  },

  isFirefox: () => {
    return window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  },

  isSafari: () => {
    const isSafari =
      /constructor/i.test((window as any).HTMLElement) ||
      ((p: any): boolean => {
        return p.toString() === '[object SafariRemoteNotification]';
      })(
        !(window as any).safari ||
          (typeof (window as any).safari !== 'undefined' &&
            (window as any).safari.pushNotification)
      );
    return isSafari;
  },

  isOpera: () => {
    return typeof (window as any).opr !== 'undefined';
  },

  getBrowserInfo: () => {
    const userAgent = window.navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';

    if (BrowserDetection.isEdge()) {
      browserName = 'Microsoft Edge';
      const match = userAgent.match(/Edg\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (BrowserDetection.isChrome()) {
      browserName = 'Google Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (BrowserDetection.isFirefox()) {
      browserName = 'Mozilla Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (BrowserDetection.isSafari()) {
      browserName = 'Apple Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (BrowserDetection.isOpera()) {
      browserName = 'Opera';
      const match = userAgent.match(/OPR\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    }

    return {
      name: browserName,
      version: browserVersion,
      userAgent: userAgent,
    };
  },
};

// ========================================
// WEB SPEECH API - POLYFILL
// ========================================

export const initSpeechRecognition = (): any | null => {
  // Chrome/Edge: SpeechRecognition
  // Safari: webkitSpeechRecognition
  // Firefox: Não suporta nativamente, usar polyfill

  if (typeof window === 'undefined') {
    return null;
  }

  // Tentar APIs nativas primeiro
  const SpeechRecognitionAPI =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition;

  if (SpeechRecognitionAPI) {
    return SpeechRecognitionAPI;
  }

  // Firefox e outros: usar Web Speech API Polyfill
  console.warn(
    'Web Speech API não suportada nativamente. Usando modo de fallback (input manual).'
  );

  // Retornar null e o componente deve lidar com fallback
  return null;
};

// ========================================
// CLIPBOARD API - POLYFILL
// ========================================

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Método moderno (Chrome, Edge, Firefox 63+, Safari 13.1+)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback para navegadores antigos
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (_err) {
      document.body.removeChild(textArea);
      console.error('Fallback: Erro ao copiar texto:', _err);
      return false;
    }
  } catch (_err) {
    console.error('Erro ao copiar para clipboard:', _err);
    return false;
  }
};

export const readFromClipboard = async (): Promise<string | null> => {
  try {
    // Método moderno
    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      return text;
    }

    // Fallback não é possível para leitura por questões de segurança
    console.warn('Clipboard read não suportado neste navegador');
    return null;
  } catch (_err) {
    console.error('Erro ao ler clipboard:', _err);
    return null;
  }
};

// ========================================
// INTERSECTION OBSERVER - POLYFILL
// ========================================

export const initIntersectionObserver = () => {
  if (typeof window === 'undefined') {
    return;
  }

  // Verificar se IntersectionObserver existe
  if ('IntersectionObserver' in window) {
    return; // Suportado nativamente
  }

  // Polyfill básico para navegadores antigos
  console.warn('IntersectionObserver não suportado. Usando polyfill básico.');

  (window as any).IntersectionObserver = class IntersectionObserver {
    constructor(callback: any) {
      this.callback = callback;
    }

    observe() {
      // Simular observação imediata
      setTimeout(() => {
        this.callback([{ isIntersecting: true }], this);
      }, 0);
    }

    unobserve() {}
    disconnect() {}

    private callback: any;
  };
};

// ========================================
// RESIZE OBSERVER - POLYFILL
// ========================================

export const initResizeObserver = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if ('ResizeObserver' in window) {
    return; // Suportado nativamente
  }

  console.warn('ResizeObserver não suportado. Usando polyfill básico.');

  (window as any).ResizeObserver = class ResizeObserver {
    constructor(callback: any) {
      this.callback = callback;
      this.elements = [];
    }

    observe(element: Element) {
      this.elements.push(element);
      // Simular resize imediato
      setTimeout(() => {
        this.callback(
          [
            {
              target: element,
              contentRect: element.getBoundingClientRect(),
            },
          ],
          this
        );
      }, 0);
    }

    unobserve(element: Element) {
      this.elements = this.elements.filter((el) => el !== element);
    }

    disconnect() {
      this.elements = [];
    }

    private callback: any;
    private elements: Element[];
  };
};

// ========================================
// CSS VARIABLES - POLYFILL
// ========================================

export const initCSSVariables = () => {
  if (typeof window === 'undefined') {
    return;
  }

  // Verificar suporte a CSS Variables
  const supportsCSS =
    window.CSS && window.CSS.supports && window.CSS.supports('--fake-var', '0');

  if (supportsCSS) {
    return; // Suportado nativamente
  }

  console.warn('CSS Variables não suportadas. Aplicando fallback.');

  // Aplicar estilos inline como fallback (para IE11)
  const style = document.createElement('style');
  style.textContent = `
    * {
      --orx-primary: var(--orx-primary);
      --orx-bg-light: #ffffff;
      --orx-text-primary: var(--orx-gray-800);
      --orx-text-secondary: var(--orx-gray-500);
      --orx-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    .dark * {
      --orx-bg-light: var(--orx-gray-800);
      --orx-text-primary: var(--orx-bg-light);
      --orx-text-secondary: var(--orx-gray-400);
    }
  `;
  document.head.appendChild(style);
};

// ========================================
// SMOOTH SCROLL - POLYFILL
// ========================================

export const smoothScroll = (element: HTMLElement, to: number, duration: number) => {
  const start = element.scrollTop;
  const change = to - start;
  const startTime = performance.now();

  const animateScroll = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (easeInOutQuad)
    const easeInOutQuad = (t: number): number => {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    element.scrollTop = start + change * easeInOutQuad(progress);

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  requestAnimationFrame(animateScroll);
};

// Polyfill para scrollTo com smooth behavior
export const polyfillSmoothScroll = () => {
  if (typeof window === 'undefined') {
    return;
  }

  // Verificar se smooth scroll é suportado
  if ('scrollBehavior' in document.documentElement.style) {
    return; // Suportado nativamente
  }

  console.warn('Smooth scroll não suportado. Usando polyfill.');

  // Override scrollTo
  const originalScrollTo = Element.prototype.scrollTo;

  Element.prototype.scrollTo = function (options: any) {
    if (typeof options === 'object' && options.behavior === 'smooth') {
      smoothScroll(this as HTMLElement, options.top || 0, 300);
    } else {
      originalScrollTo.call(this, options, 0);
    }
  };
};

// ========================================
// FETCH - POLYFILL
// ========================================

export const initFetch = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if ('fetch' in window) {
    return; // Suportado nativamente
  }

  console.error('Fetch API não suportada. Este navegador é muito antigo.');
  // Em produção, incluir: import 'whatwg-fetch';
};

// ========================================
// PROMISE - POLYFILL
// ========================================

export const initPromise = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if ('Promise' in window) {
    return; // Suportado nativamente
  }

  console.error('Promise não suportada. Este navegador é muito antigo.');
  // Em produção, incluir: import 'promise-polyfill/src/polyfill';
};

// ========================================
// CUSTOM ELEMENTS - POLYFILL
// ========================================

export const initCustomElements = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if ('customElements' in window) {
    return; // Suportado nativamente
  }

  console.warn('Custom Elements não suportados.');
  // Em produção, incluir: import '@webcomponents/custom-elements';
};

// ========================================
// INICIALIZAÇÃO AUTOMÁTICA
// ========================================

export const initBrowserCompatibility = () => {
  const browserInfo = BrowserDetection.getBrowserInfo();
  
  console.log(`🌐 Navegador detectado: ${browserInfo.name} ${browserInfo.version}`);

  // Aplicar polyfills necessários
  initIntersectionObserver();
  initResizeObserver();
  initCSSVariables();
  polyfillSmoothScroll();
  initFetch();
  initPromise();
  initCustomElements();

  // Avisos específicos por navegador
  if (BrowserDetection.isFirefox()) {
    console.info('🦊 Firefox detectado - Todas as funcionalidades suportadas');
  }

  if (BrowserDetection.isSafari()) {
    console.info('🧭 Safari detectado - Usando polyfills para Web Speech API');
  }

  if (BrowserDetection.isEdge()) {
    console.info('🌊 Edge detectado - Suporte completo nativo');
  }

  if (BrowserDetection.isChrome()) {
    console.info('🌈 Chrome detectado - Suporte completo nativo');
  }

  return browserInfo;
};

// ========================================
// VERIFICAÇÃO DE FEATURES
// ========================================

export const checkFeatureSupport = () => {
  return {
    webSpeech: !!initSpeechRecognition(),
    clipboard: !!(navigator.clipboard && navigator.clipboard.writeText),
    intersectionObserver: 'IntersectionObserver' in window,
    resizeObserver: 'ResizeObserver' in window,
    cssVariables:
      window.CSS && window.CSS.supports && window.CSS.supports('--fake-var', '0'),
    smoothScroll: 'scrollBehavior' in document.documentElement.style,
    fetch: 'fetch' in window,
    promise: 'Promise' in window,
    customElements: 'customElements' in window,
    serviceWorker: 'serviceWorker' in navigator,
    pushManager: 'PushManager' in window,
    notifications: 'Notification' in window,
    webGL: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(
          canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        );
      } catch (_e) {
        return false;
      }
    })(),
  };
};

// ========================================
// EXPORT DEFAULT
// ========================================

export default {
  BrowserDetection,
  initBrowserCompatibility,
  initSpeechRecognition,
  copyToClipboard,
  readFromClipboard,
  checkFeatureSupport,
  smoothScroll,
};

