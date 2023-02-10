import { IBaseData } from ".";

export interface IAnalysisData {
  showName: string;
  data: IBaseData;
}

export interface IAnalysisResult {
  showName: string;
  data: IBaseData;
  desc: Array<string>;
}
