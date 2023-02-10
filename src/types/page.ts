export interface PageBackground {
  imageData?: string;
  color?: string;
}

export enum PathType {
  RANGE,
  COLUMN,
  ROW,
}

export type RangeInfo = [number, number, number, number];

export type PathData = {
  path: RangeInfo;
  type: PathType;
  selectRange: RangeInfo;
  color?: string;
  pathName: string;
  rowIndex?: number;
  columnIndex?: number;
};

export interface DataSelectInfo {
  path: Array<PathData>;
  name: string;
  selectKey: string;
}
