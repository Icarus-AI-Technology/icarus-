import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "../useTheme";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useTheme", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("should initialize with light theme", () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("light");
    expect(result.current.isDark).toBe(false);
  });

  it("should toggle theme", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("dark");
    expect(result.current.isDark).toBe(true);
  });

  it("should set specific theme", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
  });

  it("should persist theme in localStorage", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("dark");
    });

    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("should load theme from localStorage", () => {
    localStorage.setItem("theme", "dark");

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("dark");
  });
});
