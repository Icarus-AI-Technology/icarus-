declare module 'posthog-js' {
  interface InitOptions {
    api_host?: string;
    autocapture?: boolean;
  }
  const posthog: {
    init: (apiKey: string, options?: InitOptions) => void;
    capture?: (event: string, properties?: Record<string, unknown>) => void;
    identify?: (distinctId: string, properties?: Record<string, unknown>) => void;
  };
  export default posthog;
}


