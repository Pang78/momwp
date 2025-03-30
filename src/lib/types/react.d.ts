declare module 'react' {
  // Reexport the React types
  export * from 'react';
  
  // Define JSX namespace if needed
  namespace JSX {
    interface Element {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
} 