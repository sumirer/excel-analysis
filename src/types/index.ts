export interface AnalysisData {
  dataInfo: {
    fileName: string;
    sheetName: string;
  };
  col: Array<string | number>;
  data: Array<Array<string | number>>;
}

export interface IDictionaries<T = unknown> {
  [key: string]: T;
}

export interface ISvgPath {
  x: number;
  y: number;
  cx: number;
  cy: number;
}

export interface ISvgCardPath<T> {
  x: number;
  y: number;
  data?: T;
  name: string;
  id: string;
}

export type IBaseData = Array<Array<string | number>>;
