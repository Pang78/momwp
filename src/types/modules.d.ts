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
  export const BarChart3: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Home: React.FC<React.SVGProps<SVGSVGElement>>;
}

declare module '@heroicons/react/24/outline' {
  export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ArrowsUpDownIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ChartPieIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ArrowUpOnSquareIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const DocumentTextIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const DocumentDuplicateIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const CodeBracketIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const QuestionMarkCircleIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const InformationCircleIcon: React.FC<React.SVGProps<SVGSVGElement>>;
}

declare module '@heroicons/react/24/solid' {
  export const ChartBarSquareIcon: React.FC<React.SVGProps<SVGSVGElement>>;
}

// Add any other modules that TypeScript can't find 

declare module 'react' {
  import * as React from 'react';
  export = React;
  export as namespace React;
}

declare module 'html2canvas' {
  const html2canvas: any;
  export default html2canvas;
}

declare module 'file-saver' {
  export function saveAs(data: Blob, filename?: string): void;
} 