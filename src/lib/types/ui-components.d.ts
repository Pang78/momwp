// Type definitions for UI components
import { ReactNode } from 'react';

// UI Component Types
declare module '@/components/ui/card' {
  export interface CardProps {
    children?: ReactNode;
    className?: string;
  }
  
  export interface CardHeaderProps {
    children?: ReactNode;
    className?: string;
  }
  
  export interface CardTitleProps {
    children?: ReactNode;
    className?: string;
  }
  
  export interface CardDescriptionProps {
    children?: ReactNode;
    className?: string;
  }
  
  export interface CardContentProps {
    children?: ReactNode;
    className?: string;
  }
  
  export interface CardFooterProps {
    children?: ReactNode;
    className?: string;
  }
  
  export function Card(props: CardProps): JSX.Element;
  export function CardHeader(props: CardHeaderProps): JSX.Element;
  export function CardTitle(props: CardTitleProps): JSX.Element;
  export function CardDescription(props: CardDescriptionProps): JSX.Element;
  export function CardContent(props: CardContentProps): JSX.Element;
  export function CardFooter(props: CardFooterProps): JSX.Element;
}

declare module '@/components/ui/alert' {
  export interface AlertProps {
    children?: ReactNode;
    variant?: string;
    className?: string;
  }
  
  export interface AlertTitleProps {
    children?: ReactNode;
    className?: string;
  }
  
  export interface AlertDescriptionProps {
    children?: ReactNode;
    className?: string;
  }
  
  export function Alert(props: AlertProps): JSX.Element;
  export function AlertTitle(props: AlertTitleProps): JSX.Element;
  export function AlertDescription(props: AlertDescriptionProps): JSX.Element;
}

declare module '@/components/ui/tabs' {
  export interface TabsProps {
    children?: ReactNode;
    defaultValue?: string;
    className?: string;
  }
  
  export interface TabsListProps {
    children?: ReactNode;
    className?: string;
  }
  
  export interface TabsTriggerProps {
    children?: ReactNode;
    value: string;
    className?: string;
  }
  
  export interface TabsContentProps {
    children?: ReactNode;
    value: string;
    className?: string;
  }
  
  export function Tabs(props: TabsProps): JSX.Element;
  export function TabsList(props: TabsListProps): JSX.Element;
  export function TabsTrigger(props: TabsTriggerProps): JSX.Element;
  export function TabsContent(props: TabsContentProps): JSX.Element;
}

// Recharts type definitions
declare module 'recharts' {
  import { ComponentType, FunctionComponent, ReactNode } from 'react';
  
  export interface BaseProps {
    children?: ReactNode;
    className?: string;
  }
  
  export interface ResponsiveContainerProps extends BaseProps {
    width?: string | number;
    height?: string | number;
    aspect?: number;
    minWidth?: number;
    minHeight?: number;
    debounce?: number;
  }
  
  export interface ChartProps extends BaseProps {
    data?: any[];
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  }
  
  export interface CartesianGridProps extends BaseProps {
    strokeDasharray?: string;
  }
  
  export interface XAxisProps extends BaseProps {
    dataKey?: string;
    type?: string;
  }
  
  export interface YAxisProps extends BaseProps {
    dataKey?: string;
    type?: string;
  }
  
  export interface TooltipProps extends BaseProps {
    cursor?: any;
  }
  
  export interface LegendProps extends BaseProps {}
  
  export interface BarProps extends BaseProps {
    dataKey: string;
    fill?: string;
  }
  
  export interface LineProps extends BaseProps {
    type?: string;
    dataKey: string;
    stroke?: string;
    dot?: any;
    strokeWidth?: number;
  }
  
  export interface ScatterProps extends BaseProps {
    name?: string;
    data?: any[];
    fill?: string;
  }
  
  export const ResponsiveContainer: FunctionComponent<ResponsiveContainerProps>;
  export const BarChart: FunctionComponent<ChartProps>;
  export const LineChart: FunctionComponent<ChartProps>;
  export const ScatterChart: FunctionComponent<ChartProps>;
  export const CartesianGrid: FunctionComponent<CartesianGridProps>;
  export const XAxis: FunctionComponent<XAxisProps>;
  export const YAxis: FunctionComponent<YAxisProps>;
  export const Tooltip: FunctionComponent<TooltipProps>;
  export const Legend: FunctionComponent<LegendProps>;
  export const Bar: FunctionComponent<BarProps>;
  export const Line: FunctionComponent<LineProps>;
  export const Scatter: FunctionComponent<ScatterProps>;
  export const Area: FunctionComponent<LineProps>;
  export const AreaChart: FunctionComponent<ChartProps>;
  export const ComposedChart: FunctionComponent<ChartProps>;
  export const PieChart: FunctionComponent<ChartProps>;
  export const Pie: FunctionComponent<{ dataKey: string; data?: any[]; fill?: string; }>;
  export const Cell: FunctionComponent<{ fill?: string; }>;
}

// Lucide React icons
declare module 'lucide-react' {
  import { ComponentType } from 'react';
  
  export interface IconProps {
    size?: number | string;
    color?: string;
    stroke?: string;
    className?: string;
  }
  
  export const Upload: ComponentType<IconProps>;
  export const Download: ComponentType<IconProps>;
  export const FileText: ComponentType<IconProps>;
  export const AlertTriangle: ComponentType<IconProps>;
}

// React types
declare module 'react' {
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
} 