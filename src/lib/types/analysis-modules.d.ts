declare module 'papaparse' {
  export interface ParseResult<T> {
    data: T[];
    errors: any[];
    meta: any;
  }

  export interface ParseConfig {
    header?: boolean;
    dynamicTyping?: boolean;
    skipEmptyLines?: boolean;
    complete?: (results: ParseResult<any>) => void;
    error?: (error: any) => void;
  }

  export function parse(file: File, config: ParseConfig): void;
}

declare module 'simple-statistics' {
  export function min(data: number[]): number;
  export function max(data: number[]): number;
  export function mean(data: number[]): number;
  export function median(data: number[]): number;
  export function standardDeviation(data: number[]): number;
  export function sampleCorrelation(x: number[], y: number[]): number;
}

declare module 'ml-matrix' {
  export class Matrix {
    constructor(rows: number, columns: number);
    constructor(data: number[][]);
    static from1DArray(rows: number, columns: number, array: number[]): Matrix;
    static zeros(rows: number, columns: number): Matrix;
    set(row: number, column: number, value: number): Matrix;
    get(row: number, column: number): number;
    mul(other: Matrix): Matrix;
    transpose(): Matrix;
    solve(value: Matrix): Matrix;
  }
}

declare module 'regression' {
  export interface RegressionResult {
    equation: number[];
    points: number[][];
    string: string;
    predict: (x: number) => [number, number];
  }

  export function linear(data: [number, number][], options?: any): RegressionResult;
  export function exponential(data: [number, number][], options?: any): RegressionResult;
  export function polynomial(data: [number, number][], options?: { order: number }): RegressionResult;
  export function logarithmic(data: [number, number][], options?: any): RegressionResult;
  export function power(data: [number, number][], options?: any): RegressionResult;
}

declare module 'jstat' {
  export function normal(mean: number, std: number): {
    pdf: (x: number) => number;
    cdf: (x: number) => number;
    inv: (p: number) => number;
  };
  export function ttest(sample1: number[], sample2: number[], tails?: number): number;
  export function anova(samples: number[][]): number;
}

declare module 'ml-savitzky-golay' {
  export interface SavitzkyGolayOptions {
    windowSize?: number;
    derivative?: number;
    polynomial?: number;
  }

  export class SavitzkyGolay {
    static savitzkyGolay(data: number[], h: number, options?: SavitzkyGolayOptions): number[];
  }
} 