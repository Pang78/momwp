declare module 'recharts' {
  import * as React from 'react';

  export interface Props {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }

  export interface CategoricalChartProps extends Props {
    width?: number;
    height?: number;
    data?: any[];
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  }

  export class BarChart extends React.Component<CategoricalChartProps> {}
  export class LineChart extends React.Component<CategoricalChartProps> {}
  export class PieChart extends React.Component<CategoricalChartProps> {}
  
  export class CartesianGrid extends React.Component<Props & {
    strokeDasharray?: string;
  }> {}
  
  export class XAxis extends React.Component<Props & {
    dataKey?: string;
  }> {}
  
  export class YAxis extends React.Component<Props> {}
  
  export class Tooltip extends React.Component<Props> {}
  export class Legend extends React.Component<Props> {}
  
  export class ResponsiveContainer extends React.Component<Props & {
    width?: number | string;
    height?: number | string;
  }> {}
  
  export class Bar extends React.Component<Props & {
    dataKey?: string;
    fill?: string;
  }> {}
  
  export class Line extends React.Component<Props & {
    type?: string;
    dataKey?: string;
    stroke?: string;
  }> {}
  
  export class Pie extends React.Component<Props & {
    data?: any[];
    dataKey?: string;
    nameKey?: string;
    cx?: string | number;
    cy?: string | number;
    outerRadius?: number;
    fill?: string;
    label?: Function | boolean | React.ReactElement | object;
  }> {}
  
  export class Cell extends React.Component<Props & {
    fill?: string;
  }> {}
} 