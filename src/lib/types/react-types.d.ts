// Type definitions for React
import * as React from 'react';

// Re-export all React types to ensure they're available
export = React;
export as namespace React;

// Add any missing types or augment existing ones
declare module 'react' {
  // Ensure useState and other hooks are exported properly
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<unknown>): void;
  export function useRef<T>(initialValue: T): { current: T };
  export function useCallback<T extends (...args: unknown[]) => unknown>(callback: T, deps: ReadonlyArray<unknown>): T;
  export function useMemo<T>(factory: () => T, deps: ReadonlyArray<unknown>): T;
}

// Enable JSX support
declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty { props: {}; }
    interface ElementChildrenAttribute { children: {}; }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
} 