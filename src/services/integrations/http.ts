import { toAppError } from "@/utils/error";

export interface FetchRetryOptions {
  retries?: number;
  backoffMs?: number;
  retryOn?: number[];
}

const DEFAULT_RETRY_STATUS = [408, 425, 429, 500, 502, 503, 504];

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: FetchRetryOptions,
): Promise<Response> {
  const {
    retries = 2,
    backoffMs = 500,
    retryOn = DEFAULT_RETRY_STATUS,
  } = options ?? {};

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= retries) {
    try {
      const response = await fetch(input, init);
      if (retryOn.includes(response.status) && attempt < retries) {
        await delay(backoffMs * 2 ** attempt);
        attempt += 1;
        continue;
      }
      return response;
    } catch (error: unknown) {
      lastError = toAppError(error);
      if (attempt >= retries) {
        throw lastError;
      }
      await delay(backoffMs * 2 ** attempt);
      attempt += 1;
    }
  }

  throw lastError ?? new Error("fetchWithRetry exhausted retries");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
import { toAppError } from '@/utils/error';

export interface FetchRetryOptions {
  retries?: number;
  backoffMs?: number;
  retryOn?: number[];
}

const DEFAULT_RETRY_STATUS = [408, 425, 429, 500, 502, 503, 504];

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: FetchRetryOptions,
): Promise<Response> {
  const {
    retries = 2,
    backoffMs = 500,
    retryOn = DEFAULT_RETRY_STATUS,
  } = options ?? {};

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= retries) {
    try {
      const response = await fetch(input, init);
      if (retryOn.includes(response.status) && attempt < retries) {
        await delay(backoffMs * Math.pow(2, attempt));
        attempt += 1;
        continue;
      }
      return response;
    } catch (error: unknown) {
      lastError = toAppError(error);
      if (attempt >= retries) {
        throw lastError;
      }
      await delay(backoffMs * Math.pow(2, attempt));
      attempt += 1;
    }
  }

  throw lastError ?? new Error('fetchWithRetry exhausted retries');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

