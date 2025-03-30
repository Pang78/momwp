// This file tells TypeScript that these modules exist
declare module '@tanstack/react-table' {
  // Re-export everything from the original module
  export * from '@tanstack/react-table';
}

declare module 'recharts' {
  // Re-export everything from the original module
  export * from 'recharts';
}

declare module 'lucide-react' {
  // Re-export icons
  export const Search: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ArrowLeft: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Download: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ArrowUpDown: React.FC<React.SVGProps<SVGSVGElement>>;
  export const X: React.FC<React.SVGProps<SVGSVGElement>>;
}

// Add any other modules that TypeScript can't find 