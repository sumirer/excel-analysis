export interface ICellSize {
  width: number;
  height: number;
}

export abstract class LifeCycle {
  abstract dispose(): void;
}

export type RenderCallback = (index: number, height: number) => void;

export type ScrollCallback = (position: IScrollPosition) => void;

export interface IScrollPosition {
  x: number;
  y: number;
}

export interface ITableLayout {
  areaWidth: number;
  areaHeight: number;
  leftFixedWidth: number;
  rightFixedWidth: number;
  viewportHeight: number;
  viewportWidth: number;
  renderFillDistance: number;
  headerHeight: number;
  scrollBodyHeight: number;
  scrollBodyWidth: number;
}

export interface ICellPosition {
  x: number;
  y: number;
}

export interface IRenderData {
  horizontalStartIndex: number;
  horizontalEndIndex: number;
  verticalStartIndex: number;
  verticalEndIndex: number;
}

export enum EDataChangeEnum {
  PUSH,
  SLICE,
  REPLACE,
  CHANGE,
}

export type IDataWatch<T> = (data: T, type: EDataChangeEnum, lastLength: number) => void;
