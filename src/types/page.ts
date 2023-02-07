export interface PageBackground {
  imageData?: string;
  color?: string;
}

export type PathData = [number, number, number, number];

export interface DataSelectInfo {
  path: PathData;
  name: string;
  selectKey: string;
  selectRange: PathData;
  color?: string;
}
