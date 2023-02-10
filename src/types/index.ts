import { ExcelInfo } from "@/excel/ExcelInfo";

export interface AnalysisData {
  dataInfo: {
    fileName: string;
    sheetName: string;
  };
  col: Array<string | number>;
  data: Array<Array<string | number>>;
  excelInfo: ExcelInfo;
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

export type IFilterSelectData = Array<IFilterSelectDataInfo>;


export type IFilterSelectDataInfo = {
  name: string;
  data: Array<number>;
}