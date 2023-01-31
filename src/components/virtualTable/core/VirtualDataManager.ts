import { IDictionaries } from "@/types";
import { ITableColumn } from "@/types/table";
import { EDataChangeEnum, IDataWatch } from "@/types/virtual";
import { flatColumn } from "../utils/columnUtils";

export default class VirtualDataManager<T = IDictionaries> {
  constructor(private data: Array<T>, private columns: Array<ITableColumn>) {
    this.parseData(columns);
  }

  protected eventListener: Array<IDataWatch<Array<T>>> = [];

  public leftFixedColumns: Array<ITableColumn> = [];

  public rightFixedColumns: Array<ITableColumn> = [];

  public otherColumns: Array<ITableColumn> = [];

  public headerRenderLeftFixedColumns: Array<ITableColumn> = [];

  public headerRenderRightFixedColumns: Array<ITableColumn> = [];

  public headerRenderOtherColumns: Array<ITableColumn> = [];

  protected columnsChangeCallback?: VoidFunction;

  protected parseData(columns: Array<ITableColumn>): void {
    this.clearColumnData();
    columns.forEach((col) => {
      if (col.fixed === "right") {
        this.headerRenderRightFixedColumns.push(col);
      } else if (col.fixed === "left") {
        this.headerRenderLeftFixedColumns.push(col);
      } else {
        this.headerRenderOtherColumns.push(col);
      }
    });
    this.leftFixedColumns = flatColumn(this.headerRenderLeftFixedColumns);
    this.rightFixedColumns = flatColumn(this.headerRenderRightFixedColumns);
    this.otherColumns = flatColumn(this.headerRenderOtherColumns);
  }

  protected clearColumnData(): void {
    this.leftFixedColumns = [];
    this.rightFixedColumns = [];
    this.otherColumns = [];
    this.headerRenderLeftFixedColumns = [];
    this.headerRenderRightFixedColumns = [];
    this.headerRenderOtherColumns = [];
  }

  public registerDataWatch(callback: IDataWatch<Array<T>>): void {
    this.eventListener.push(callback);
  }

  public unregisterDataWatch(callback: IDataWatch<Array<T>>): void {
    this.eventListener.splice(this.eventListener.indexOf(callback), 1);
  }

  private notifyDataChange(type: EDataChangeEnum, lastLength: number): void {
    this.eventListener.forEach((callback) => {
      callback(this.data, type, lastLength);
    });
  }

  public pushData(...arg: Array<T>): number {
    const lastLength = this.data.length;
    const length = this.data.push(...arg);
    this.notifyDataChange(EDataChangeEnum.PUSH, lastLength);
    return length;
  }

  public changeData(data: Array<T>): void {
    this.data = data;
    this.notifyDataChange(EDataChangeEnum.CHANGE, -1);
  }

  public spliceData(startIndex: number, deleteCount: number): Array<T> {
    const lastLength = this.data.length;
    const result = this.data.splice(startIndex, deleteCount);
    this.notifyDataChange(EDataChangeEnum.SLICE, lastLength);
    return result;
  }

  public replaceData(index: number, data: T): void {
    const lastLength = this.data.length;
    this.data[index] = data;
    this.notifyDataChange(EDataChangeEnum.REPLACE, lastLength);
  }

  public updateColumns(newColumns: Array<ITableColumn>): void {
    this.parseData(newColumns);
    this.columnsChangeCallback?.();
  }

  public registerColumnChangeCallback(callback: VoidFunction): void {
    this.columnsChangeCallback = callback;
  }

  public getData(): Array<T> {
    return this.data;
  }

  public getDataLength(): number {
    return this.data.length;
  }

  public getColumns(): Array<ITableColumn> {
    return this.columns;
  }
}
